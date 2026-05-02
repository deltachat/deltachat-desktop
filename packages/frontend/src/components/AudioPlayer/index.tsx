import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './styles.module.scss';
import ForceMutedAudioPlayer from './ForceMutedAudioPlayer';
import {
  extractAudioMetadata,
  type ExtractedAudioMetadata,
} from './extractAudioMetadata';

export type AudioPlayerProps = {
  src: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  fileName?: string;
  duration?: number;
  hideArtist?: boolean;
  className?: string;

  onPlay?: React.ReactEventHandler<HTMLAudioElement>;
  onPause?: React.ReactEventHandler<HTMLAudioElement>;
  onEnded?: React.ReactEventHandler<HTMLAudioElement>;
  onError?: React.ReactEventHandler<HTMLAudioElement>;
  onTimeUpdate?: React.ReactEventHandler<HTMLAudioElement>;
  onLoadedMetadata?: React.ReactEventHandler<HTMLAudioElement>;
  onDurationChange?: React.ReactEventHandler<HTMLAudioElement>;
};

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
    const withoutHash = src.split('#')[0];
    const withoutQuery = withoutHash.split('?')[0];
    const lastPart = withoutQuery.split('/').pop();
    if (!lastPart) return undefined;
    const decoded = decodeURIComponent(lastPart).trim();
    return decoded && !isProbablyHashLike(decoded) ? decoded : undefined;
  } catch {
    return undefined;
  }
}

function removeAudioExtension(fileName: string): string {
  return fileName.replace(/\.(mp3|m4a|aac|ogg|opus|wav|flac|webm|amr|mpeg)$/i, '').trim();
}

function guessMetadataFromFileName(fileName?: string): { title?: string; artist?: string } {
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

export function AudioPlayer({
  src,
  title: propTitle,
  artist: propArtist,
  coverUrl: propCoverUrl,
  fileName: propFileName,
  duration: propDuration,
  hideArtist = false,
  className,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  onLoadedMetadata,
  onDurationChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const metadataCoverUrlRef = useRef<string | undefined>(undefined);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [internalDuration, setInternalDuration] = useState(propDuration ?? 0);
  const [seekPreview, setSeekPreview] = useState<number | null>(null);

  const [extractedMetadata, setExtractedMetadata] = useState<ExtractedAudioMetadata>({});
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsSeeking(false);
    setIsLoading(false);
    setHasError(false);
    setSeekPreview(null);
    setInternalDuration(propDuration ?? 0);
    setExtractedMetadata({});
    setIsMetadataLoading(false);

    if (metadataCoverUrlRef.current) {
      URL.revokeObjectURL(metadataCoverUrlRef.current);
      metadataCoverUrlRef.current = undefined;
    }
  }, [src, propDuration]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      if (!src) return;

      setIsMetadataLoading(true);

      try {
        const metadata = await extractAudioMetadata(src);

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

        setExtractedMetadata(metadata);
      } catch (error) {
        console.warn('Failed to extract audio metadata:', error);

        if (!cancelled) {
          setExtractedMetadata({});
        }
      } finally {
        if (!cancelled) {
          setIsMetadataLoading(false);
        }
      }
    }

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      if (metadataCoverUrlRef.current) {
        URL.revokeObjectURL(metadataCoverUrlRef.current);
        metadataCoverUrlRef.current = undefined;
      }
    };
  }, []);

  const fallbackFileName = useMemo(() => {
    return cleanText(propFileName) || getFileNameFromSrc(src);
  }, [propFileName, src]);

  const guessed = useMemo(() => {
    return guessMetadataFromFileName(fallbackFileName);
  }, [fallbackFileName]);

  const resolvedTitle =
    cleanText(propTitle) ||
    cleanText(extractedMetadata.title) ||
    guessed.title ||
    fallbackFileName ||
    'Audio';

  const resolvedArtist =
    cleanText(propArtist) ||
    cleanText(extractedMetadata.artist) ||
    guessed.artist;

  const resolvedCoverUrl =
    propCoverUrl ||
    extractedMetadata.coverUrl;

  const resolvedDuration = propDuration ?? internalDuration ?? 0;

  const progressPercent = resolvedDuration > 0
    ? clamp(((seekPreview ?? currentTime) / resolvedDuration) * 100, 0, 100)
    : 0;

  const displayedCurrentTime = seekPreview ?? currentTime;

  const handleTogglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        setHasError(false);
        setIsLoading(true);
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
  }, []);

  const handleLoadedMetadata = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }

      onLoadedMetadata?.(event);
    },
    [onLoadedMetadata]
  );

  const handleDurationChange = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;

      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setInternalDuration(audio.duration);
      }

      onDurationChange?.(event);
    },
    [onDurationChange]
  );

  const handleTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;

      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }

      onTimeUpdate?.(event);
    },
    [isSeeking, onTimeUpdate]
  );

  const handlePlay = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      setIsPlaying(true);
      setIsLoading(false);
      setHasError(false);
      onPlay?.(event);
    },
    [onPlay]
  );

  const handlePause = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      setIsPlaying(false);
      setIsLoading(false);
      onPause?.(event);
    },
    [onPause]
  );

  const handleEnded = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentTime(0);
      setSeekPreview(null);
      onEnded?.(event);
    },
    [onEnded]
  );

  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLAudioElement>) => {
      setHasError(true);
      setIsPlaying(false);
      setIsLoading(false);
      onError?.(event);
    },
    [onError]
  );

  const handleSeekChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setSeekPreview(nextValue);
  }, []);

  const commitSeek = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value;
    setCurrentTime(value);
    setSeekPreview(null);
  }, []);

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
    isMetadataLoading ? styles.isMetadataLoading : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClassName}>
      <ForceMutedAudioPlayer
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
      />

      <button
        type="button"
        className={styles.cover}
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
      >
        {resolvedCoverUrl ? (
          <img
            src={resolvedCoverUrl}
            alt={resolvedTitle}
            className={styles.coverImage}
            draggable={false}
          />
        ) : (
          <div className={styles.coverFallback}>{getInitials(resolvedTitle)}</div>
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
              ref={progressRef}
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
            فایل صوتی قابل پخش نیست.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AudioPlayer;
