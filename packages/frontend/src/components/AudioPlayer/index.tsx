/**
 * Provides audio playback UI and resolves display metadata from multiple sources.
 *
 * Priority order:
 * 1. Explicit component props
 * 2. Native audio element metadata
 * 3. `music-metadata` blob parsing
 * 4. File name inference
 *
 * Metadata extraction is intentionally non-blocking so the player UI can render
 * immediately and update later only when extra metadata becomes available.
 *
 * Playback is handled by a module-level persistent audio element so audio keeps
 * playing even when this component unmounts, for example when leaving a chat.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';
import ForceMutedAudioPlayer from './ForceMutedAudioPlayer';

export type AudioPlayerProps = {
  src: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  fileName?: string;
  duration?: number;
  hideArtist?: boolean;
  className?: string;
  tabIndex?: number;

  onPlay?: React.ReactEventHandler<HTMLAudioElement>;
  onPause?: React.ReactEventHandler<HTMLAudioElement>;
  onEnded?: React.ReactEventHandler<HTMLAudioElement>;
  onError?: React.ReactEventHandler<HTMLAudioElement>;
  onTimeUpdate?: React.ReactEventHandler<HTMLAudioElement>;
  onLoadedMetadata?: React.ReactEventHandler<HTMLAudioElement>;
  onDurationChange?: React.ReactEventHandler<HTMLAudioElement>;

  /**
   * Called only when playback is started by the user's interaction with this UI.
   * This must not be forwarded to the native <audio> element because it is not
   * a valid HTML audio prop.
   */
  onPlayNonProgrammatic?: () => void;
};

type ExtractedAudioMetadata = {
  title?: string;
  artist?: string;
  coverUrl?: string;
  duration?: number;
};

type PersistentAudioState = {
  audio: HTMLAudioElement | null;
  currentSrc?: string;
};

const persistentAudioState: PersistentAudioState = {
  audio: null,
  currentSrc: undefined,
};

function getPersistentAudioElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;

  if (!persistentAudioState.audio) {
    const audio = new Audio();

    audio.preload = 'metadata';
    audio.controls = false;

    /*
     * We intentionally do not append it to the React tree.
     * This element must survive component unmounts.
     */
    persistentAudioState.audio = audio;
  }

  return persistentAudioState.audio;
}

function pauseOtherMediaElementsExcept(current: HTMLMediaElement) {
  if (typeof document === 'undefined') return;

  const mediaElements = document.querySelectorAll('audio, video');

  mediaElements.forEach((element) => {
    if (
      element instanceof HTMLMediaElement &&
      element !== current &&
      !element.paused
    ) {
      element.pause();
    }
  });
}

function createSyntheticLikeAudioEvent(
  audio: HTMLAudioElement,
  type: string
): React.SyntheticEvent<HTMLAudioElement> {
  return {
    currentTarget: audio,
    target: audio,
    type,
    nativeEvent: new Event(type),
    bubbles: false,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: true,
    timeStamp: Date.now(),

    preventDefault: () => {},
    isDefaultPrevented: () => false,
    stopPropagation: () => {},
    isPropagationStopped: () => false,
    persist: () => {},
  } as unknown as React.SyntheticEvent<HTMLAudioElement>;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function cleanText(value?: string): string | undefined {
  const cleaned = value?.replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

function isProbablyHashLike(value?: string): boolean {
  if (!value) return false;
  const clean = value.replace(/\.[^/.]+$/, '').replace(/[-_\s]/g, '').trim();
  if (!clean) return false;

  return (
    (clean.length >= 24 && /^[a-f0-9]+$/i.test(clean)) ||
    (clean.length >= 28 && /^[a-z0-9]+$/i.test(clean))
  );
}

function getFileNameFromSrc(src?: string): string | undefined {
  if (!src) return undefined;

  try {
    const normalizedSrc = src.replace(/\\/g, '/');
    const withoutHash = normalizedSrc.split('#')[0];
    const withoutQuery = withoutHash.split('?')[0];
    const lastPart = withoutQuery.split('/').pop();
    if (!lastPart) return undefined;
    const decoded = decodeURIComponent(lastPart).trim();
    return decoded && !isProbablyHashLike(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

function getAudioExtension(fileName?: string): string | undefined {
  if (!fileName) return undefined;
  const match = fileName
    .split('?')[0]
    .split('#')[0]
    .match(/\.([a-z0-9]+)$/i);

  return match?.[1]?.toLowerCase();
}

function getAudioFormatLabel(extension?: string): string | undefined {
  if (!extension) return undefined;
  return `${extension.toUpperCase()} file`;
}

function removeAudioExtension(fileName: string): string {
  return fileName
    .replace(/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm|amr|mpeg)$/i, '')
    .trim();
}

function guessMetadataFromFileName(
  fileName?: string
): { title?: string; artist?: string } {
  if (!fileName) return {};
  const fileNameWithoutQuery = fileName.split('?')[0].split('#')[0];
  if (isProbablyHashLike(fileNameWithoutQuery)) return {};

  const cleanName = removeAudioExtension(fileNameWithoutQuery)
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanName || isProbablyHashLike(cleanName)) return {};

  const separators = [' - ', ' – ', ' — ', '-'];

  for (const separator of separators) {
    if (cleanName.includes(separator)) {
      const [possibleArtist, ...titleParts] = cleanName.split(separator);
      const guessedArtist = possibleArtist?.trim();
      const guessedTitle = titleParts.join(separator).trim();

      if (guessedArtist && guessedTitle) {
        return {
          artist: guessedArtist,
          title: guessedTitle,
        };
      }
    }
  }

  return { title: cleanName };
}

function getInitials(title?: string): string {
  const safe = cleanText(title);
  if (!safe) return 'A';

  const words = safe.split(' ').filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 1).toUpperCase();
  }

  return `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`.toUpperCase();
}

function uint8ArrayToBlob(data: Uint8Array, mimeType?: string): Blob {
  const arrayBuffer = new ArrayBuffer(data.byteLength);
  const view = new Uint8Array(arrayBuffer);

  view.set(data);

  return new Blob([arrayBuffer], { type: mimeType || 'image/jpeg' });
}

async function extractAudioMetadataWithMusicMetadata(
  src: string,
  signal?: AbortSignal
): Promise<ExtractedAudioMetadata> {
  const response = await fetch(src, { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch audio source: ${response.status}`);
  }

  const blob = await response.blob();
  const { parseBlob } = await import('music-metadata');
  const metadata = await parseBlob(blob);

  const title = cleanText(metadata.common.title);
  const artist = cleanText(metadata.common.artist);
  const duration =
    typeof metadata.format.duration === 'number' &&
    Number.isFinite(metadata.format.duration) &&
    metadata.format.duration > 0
      ? metadata.format.duration
      : undefined;

  const picture = metadata.common.picture?.[0];
  let coverUrl: string | undefined;

  if (picture?.data) {
    const imageBlob = uint8ArrayToBlob(
      picture.data,
      picture.format || 'image/jpeg'
    );
    coverUrl = URL.createObjectURL(imageBlob);
  }

  return {
    title,
    artist,
    coverUrl,
    duration,
  };
}

export function AudioPlayer({
  src,
  title: propTitle,
  artist: propArtist,
  coverUrl: propCoverUrl,
  fileName: propFileName,
  duration: propDuration,
  hideArtist = false,
  className,
  tabIndex,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onLoadedMetadata,
  onDurationChange,
  onPlayNonProgrammatic,
}: AudioPlayerProps) {
  const metadataAudioRef = useRef<HTMLAudioElement | null>(null);
  const metadataCoverUrlRef = useRef<string | undefined>(undefined);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [internalDuration, setInternalDuration] = useState(propDuration ?? 0);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const [extractedMetadata, setExtractedMetadata] =
    useState<ExtractedAudioMetadata>({});

  const isThisSourceActive = useCallback(() => {
    return persistentAudioState.currentSrc === src;
  }, [src]);

  useEffect(() => {
    setSeekPreview(null);
    setIsSeeking(false);
    setHasError(false);
    setInternalDuration(propDuration ?? 0);
    setExtractedMetadata({});

    const audio = getPersistentAudioElement();

    if (audio && persistentAudioState.currentSrc === src) {
      setCurrentTime(audio.currentTime || 0);
      setIsPlaying(!audio.paused && !audio.ended);
      setIsLoading(false);

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }
    } else {
      setCurrentTime(0);
      setIsPlaying(false);
      setIsLoading(false);
    }

    if (metadataCoverUrlRef.current) {
      URL.revokeObjectURL(metadataCoverUrlRef.current);
      metadataCoverUrlRef.current = undefined;
    }
  }, [src, propDuration]);

  const fallbackFileName = useMemo(() => {
    return cleanText(propFileName) || getFileNameFromSrc(src);
  }, [propFileName, src]);

  const displayFileName = useMemo(() => {
    if (!fallbackFileName) return undefined;

    const fileNameWithoutQuery = fallbackFileName.split('?')[0].split('#')[0];

    const cleanName = removeAudioExtension(fileNameWithoutQuery)
      .replace(/[_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanText(cleanName);
  }, [fallbackFileName]);

  const guessed = useMemo(() => {
    return guessMetadataFromFileName(fallbackFileName);
  }, [fallbackFileName]);

  const fileExtension = useMemo(() => {
    return getAudioExtension(cleanText(propFileName) || src || fallbackFileName);
  }, [propFileName, src, fallbackFileName]);

  const isMp3Like = fileExtension === 'mp3';

  const hasEnoughDisplayMetadata = useMemo(() => {
    const hasTitle = !!cleanText(propTitle) || !!guessed.title;
    const hasArtist = !!cleanText(propArtist) || !!guessed.artist;
    const hasCover = !!propCoverUrl;
    const hasDuration = typeof propDuration === 'number' && propDuration > 0;

    return hasTitle && hasArtist && hasCover && hasDuration;
  }, [propTitle, propArtist, propCoverUrl, propDuration, guessed]);

  useEffect(() => {
    if (!src || hasEnoughDisplayMetadata) {
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      void (async () => {
        try {
          const metadata = await extractAudioMetadataWithMusicMetadata(
            src,
            controller.signal
          );

          if (cancelled) {
            if (metadata.coverUrl) {
              URL.revokeObjectURL(metadata.coverUrl);
            }
            return;
          }

          if (metadataCoverUrlRef.current) {
            URL.revokeObjectURL(metadataCoverUrlRef.current);
            metadataCoverUrlRef.current = undefined;
          }

          if (metadata.coverUrl) {
            metadataCoverUrlRef.current = metadata.coverUrl;
          }

          setExtractedMetadata((prev) => ({
            title: prev.title || metadata.title,
            artist: prev.artist || metadata.artist,
            coverUrl: prev.coverUrl || metadata.coverUrl,
            duration: prev.duration || metadata.duration,
          }));

          if (
            !propDuration &&
            typeof metadata.duration === 'number' &&
            Number.isFinite(metadata.duration) &&
            metadata.duration > 0
          ) {
            setInternalDuration(metadata.duration);
          }
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }

          console.warn('Failed to extract audio metadata:', error);
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [src, propDuration, hasEnoughDisplayMetadata]);

  useEffect(() => {
    return () => {
      if (metadataCoverUrlRef.current) {
        URL.revokeObjectURL(metadataCoverUrlRef.current);
        metadataCoverUrlRef.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const audio = getPersistentAudioElement();
    if (!audio) return;

    const handleLoadedMetadataNative = () => {
      if (!isThisSourceActive()) return;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }

      onLoadedMetadata?.(
        createSyntheticLikeAudioEvent(audio, 'loadedmetadata')
      );
    };

    const handleDurationChangeNative = () => {
      if (!isThisSourceActive()) return;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }

      onDurationChange?.(
        createSyntheticLikeAudioEvent(audio, 'durationchange')
      );
    };

    const handleTimeUpdateNative = () => {
      if (!isThisSourceActive()) return;

      if (!isSeeking) {
        setCurrentTime(audio.currentTime || 0);
      }

      onTimeUpdate?.(
        createSyntheticLikeAudioEvent(audio, 'timeupdate')
      );
    };

    const handlePlayNative = () => {
      if (!isThisSourceActive()) return;

      setIsPlaying(true);
      setIsLoading(false);
      setHasError(false);

      onPlay?.(createSyntheticLikeAudioEvent(audio, 'play'));
    };

    const handlePauseNative = () => {
      if (!isThisSourceActive()) return;

      setIsPlaying(false);
      setIsLoading(false);

      onPause?.(createSyntheticLikeAudioEvent(audio, 'pause'));
    };

    const handleEndedNative = () => {
      if (!isThisSourceActive()) return;

      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      setSeekPreview(null);

      onEnded?.(createSyntheticLikeAudioEvent(audio, 'ended'));
    };

    const handleErrorNative = () => {
      if (!isThisSourceActive()) return;

      setHasError(true);
      setIsPlaying(false);
      setIsLoading(false);

      onError?.(createSyntheticLikeAudioEvent(audio, 'error'));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadataNative);
    audio.addEventListener('durationchange', handleDurationChangeNative);
    audio.addEventListener('timeupdate', handleTimeUpdateNative);
    audio.addEventListener('play', handlePlayNative);
    audio.addEventListener('pause', handlePauseNative);
    audio.addEventListener('ended', handleEndedNative);
    audio.addEventListener('error', handleErrorNative);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadataNative);
      audio.removeEventListener('durationchange', handleDurationChangeNative);
      audio.removeEventListener('timeupdate', handleTimeUpdateNative);
      audio.removeEventListener('play', handlePlayNative);
      audio.removeEventListener('pause', handlePauseNative);
      audio.removeEventListener('ended', handleEndedNative);
      audio.removeEventListener('error', handleErrorNative);

      /*
       * Important:
       * Do not pause the persistent audio here.
       * This is exactly what lets audio keep playing after leaving the chat.
       */
    };
  }, [
    src,
    isSeeking,
    isThisSourceActive,
    onPlay,
    onPause,
    onEnded,
    onError,
    onTimeUpdate,
    onLoadedMetadata,
    onDurationChange,
  ]);

  const explicitTitle = cleanText(propTitle);
  const explicitArtist = cleanText(propArtist);
  const extractedTitle = cleanText(extractedMetadata.title);
  const extractedArtist = cleanText(extractedMetadata.artist);

  const hasRealMetadata = !!(
    explicitTitle ||
    explicitArtist ||
    extractedTitle ||
    extractedArtist
  );

  const isVoiceMessage = useMemo(() => {
    if (hasRealMetadata) return false;

    // If we have any usable file name or extension, treat it as a regular audio file,
    // not a voice message. This fixes attached WAV/OGG/FLAC files being hidden.
    if (fallbackFileName && !fallbackFileName.includes('\\')) {
      return false;
    }

    if (fileExtension) {
      return false;
    }

    return true;
  }, [hasRealMetadata, fallbackFileName, fileExtension]);

  const formatLabel = useMemo(() => {
    return getAudioFormatLabel(fileExtension);
  }, [fileExtension]);

  const resolvedTitle = useMemo(() => {
    if (isVoiceMessage) return undefined;

    if (!isMp3Like) {
      return (
        explicitTitle ||
        extractedTitle ||
        displayFileName ||
        guessed.title
      );
    }

    return (
      explicitTitle ||
      extractedTitle ||
      guessed.title ||
      displayFileName ||
      fallbackFileName
    );
  }, [
    isVoiceMessage,
    isMp3Like,
    explicitTitle,
    extractedTitle,
    displayFileName,
    guessed.title,
    fallbackFileName,
  ]);

  const resolvedArtist = useMemo(() => {
    if (isVoiceMessage) return undefined;

    if (!isMp3Like) {
      return (
        explicitArtist ||
        extractedArtist ||
        guessed.artist ||
        formatLabel
      );
    }

    return (
      explicitArtist ||
      extractedArtist ||
      guessed.artist
    );
  }, [
    isVoiceMessage,
    isMp3Like,
    explicitArtist,
    extractedArtist,
    guessed.artist,
    formatLabel,
  ]);

  const resolvedCoverUrl = propCoverUrl || extractedMetadata.coverUrl;

  const resolvedDuration =
    propDuration ||
    internalDuration ||
    extractedMetadata.duration ||
    0;

  const progressPercent =
    resolvedDuration > 0
      ? clamp(((seekPreview ?? currentTime) / resolvedDuration) * 100, 0, 100)
      : 0;

  const displayedCurrentTime = seekPreview ?? currentTime;

  const handleTogglePlay = useCallback(async () => {
    const audio = getPersistentAudioElement();
    if (!audio) return;

    try {
      if (persistentAudioState.currentSrc !== src) {
        persistentAudioState.currentSrc = src;
        audio.src = src;
        audio.currentTime = 0;
        setCurrentTime(0);
      }

      if (audio.paused || audio.ended) {
        setHasError(false);
        setIsLoading(true);

        onPlayNonProgrammatic?.();
        pauseOtherMediaElementsExcept(audio);

        await audio.play();
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error('Audio play/pause failed:', error);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [src, onPlayNonProgrammatic]);

  const handleMetadataAudioLoadedMetadata = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;

      if (
        !isThisSourceActive() &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        setInternalDuration(audio.duration);
      }
    },
    [isThisSourceActive]
  );

  const handleMetadataAudioDurationChange = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;

      if (
        !isThisSourceActive() &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        setInternalDuration(audio.duration);
      }
    },
    [isThisSourceActive]
  );

  const handleSeekChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSeekPreview(Number(event.target.value));
    },
    []
  );

  const commitSeek = useCallback(
    (value: number) => {
      const audio = getPersistentAudioElement();
      if (!audio) return;

      if (persistentAudioState.currentSrc !== src) {
        persistentAudioState.currentSrc = src;
        audio.src = src;
        audio.currentTime = 0;
      }

      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : resolvedDuration;

      const safeValue =
        duration > 0 ? clamp(value, 0, duration) : Math.max(0, value);

      audio.currentTime = safeValue;
      setCurrentTime(safeValue);
      setSeekPreview(null);
    },
    [src, resolvedDuration]
  );

  const handleSeekStart = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const handleSeekEnd = useCallback(() => {
    setIsSeeking(false);

    if (seekPreview != null) {
      commitSeek(seekPreview);
    }
  }, [seekPreview, commitSeek]);

  const rootClassName = [
    styles.audioPlayer,
    isPlaying ? styles.isPlaying : '',
    hasError ? styles.hasError : '',
    isVoiceMessage ? styles.isVoiceMessage : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      {/*
        This stays here only for compatibility with your existing architecture
        and metadata preload behavior.

        Real playback is NOT done by this element anymore, because this element
        will unmount when leaving the chat. Real playback is handled by the
        persistent audio element above.
      */}
      <ForceMutedAudioPlayer
        ref={metadataAudioRef}
        src={src}
        onLoadedMetadata={handleMetadataAudioLoadedMetadata}
        onDurationChange={handleMetadataAudioDurationChange}
      />

      <button
        type="button"
        className={styles.cover}
        onClick={handleTogglePlay}
        tabIndex={tabIndex}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {resolvedCoverUrl ? (
          <img
            src={resolvedCoverUrl}
            alt={isVoiceMessage ? '' : 'Audio file'}
            className={styles.coverImage}
            draggable={false}
          />
        ) : (
          <div className={styles.coverFallback}>
            {isVoiceMessage ? '' : getInitials(resolvedTitle || '')}
          </div>
        )}

        <span className={styles.coverOverlayButton}>
          {isLoading ? (
            <span className={styles.loader} />
          ) : isPlaying ? (
            <span className={styles.pauseIcon}>
              <span />
              <span />
            </span>
          ) : (
            <span className={styles.playIcon} />
          )}
        </span>
      </button>

      <div className={styles.main}>
        <div className={styles.textRow}>
          {!isVoiceMessage ? (
            <div className={styles.meta}>
              <div className={styles.title} title={resolvedTitle}>
                {resolvedTitle}
              </div>

              {!hideArtist && resolvedArtist ? (
                <div className={styles.artist} title={resolvedArtist}>
                  {resolvedArtist}
                </div>
              ) : null}
            </div>
          ) : (
            <div className={styles.metaSpacer} />
          )}

          <div className={styles.timeBlock}>
            <span className={styles.currentTime}>
              {formatTime(displayedCurrentTime)}
            </span>
            <span className={styles.timeDivider}>/</span>
            <span className={styles.duration}>
              {formatTime(resolvedDuration)}
            </span>
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />

            <input
              type="range"
              min={0}
              max={resolvedDuration || 0}
              step={0.01}
              value={seekPreview ?? currentTime}
              className={styles.progressInput}
              onChange={handleSeekChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
            />
          </div>
        </div>

        {hasError ? (
          <div className={styles.errorText}>
            Audio file cannot be played.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AudioPlayer;
