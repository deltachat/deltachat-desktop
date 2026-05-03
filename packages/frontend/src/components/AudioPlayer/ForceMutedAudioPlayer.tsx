import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type ForceMutedAudioPlayerProps = React.AudioHTMLAttributes<HTMLAudioElement>;

const activeAudioElements = new Set<HTMLAudioElement>();

function registerAudio(audio: HTMLAudioElement) {
  activeAudioElements.add(audio);
}

function unregisterAudio(audio: HTMLAudioElement) {
  activeAudioElements.delete(audio);
}

function pauseAllExcept(current: HTMLAudioElement) {
  activeAudioElements.forEach((audio) => {
    if (audio !== current && !audio.paused) {
      audio.pause();
    }
  });

  if (typeof document !== 'undefined') {
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
}

export const ForceMutedAudioPlayer = forwardRef<
  HTMLAudioElement,
  ForceMutedAudioPlayerProps
>(function ForceMutedAudioPlayer(props, forwardedRef) {
  const innerRef = useRef<HTMLAudioElement | null>(null);

  useImperativeHandle(forwardedRef, () => innerRef.current as HTMLAudioElement, []);

  useEffect(() => {
    const audio = innerRef.current;
    if (!audio) return;

    registerAudio(audio);

    const handlePlay = () => {
      pauseAllExcept(audio);
    };

    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('play', handlePlay);
      unregisterAudio(audio);
    };
  }, []);

  return <audio ref={innerRef} preload="metadata" {...props} />;
});

export default ForceMutedAudioPlayer;
