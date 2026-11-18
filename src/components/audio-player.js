export const AUDIO_PREF_KEYS = {
  playbackRate: 'audio-playback-rate',
  volume: 'audio-volume',
  muted: 'audio-muted',
  ambientMode: 'ambient-sound-mode'
};

export const VALID_PLAYBACK_RATES = [1, 1.25, 1.5, 2];

function getStorageItem(key, fallback = null) {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val === null || val === undefined ? fallback : val;
  } catch {
    return fallback;
  }
}

function setStorageItem(key, value) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

function normalizeAmbientMode(mode) {
  if (mode === 'rain' || mode === 'fire') return mode;
  return 'silence';
}

function parsePlaybackRate(raw) {
  const num = parseFloat(raw);
  return VALID_PLAYBACK_RATES.includes(num) ? num : 1;
}

function parseVolume(raw) {
  const num = parseFloat(raw);
  if (Number.isFinite(num) && num >= 0 && num <= 1) {
    return num;
  }
  return 1;
}

function isAutoplayBlockedError(err) {
  if (!err) return false;
  if (err.name === 'NotAllowedError') return true;
  const msg = String(err.message || err);
  return /notallowed|autoplay|user.*gestur|interact/i.test(msg);
}

function invokeAudioPlay(audioEl, onSuccess, onError) {
  if (!audioEl || typeof audioEl.play !== 'function') return;
  try {
    const result = audioEl.play();
    if (result && typeof result.then === 'function') {
      result.then(() => {
        if (onSuccess) onSuccess();
      }).catch((err) => {
        if (onError) onError(err);
      });
    } else if (onSuccess) {
      onSuccess();
    }
  } catch (err) {
    if (onError) onError(err);
  }
}

function markAmbientOfflineAvailability(container, sounds) {
  if (typeof caches === 'undefined' || !container) return;
  Object.entries(sounds).forEach(([soundKey, soundPath]) => {
    const btn = container.querySelector(`.ambient-btn[data-sound="${soundKey}"]`);
    if (!btn) return;
    caches.match(soundPath).then((matched) => {
      if (matched) {
        btn.setAttribute('data-offline-ready', 'true');
        btn.classList.add('offline-ready');
      }
    }).catch(() => {});
  });
}

function setupMediaSession({ container, baseUrl = '/', narrationAudio, updateProgressVisual, options = {} }) {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) return;

  try {
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const title = options.title || container?.querySelector('h1')?.textContent?.trim() || 'Poema';
    const artist = options.artist || 'Natanael Fernando Gatti Brentano';
    const album = options.album || 'Poemas Brasileiros';
    const artwork = Array.isArray(options.artwork) ? options.artwork : [
      { src: `${normalizedBase}icons/icon-192x192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${normalizedBase}icons/icon-512x512.png`, sizes: '512x512', type: 'image/png' },
      { src: `${normalizedBase}og-cover.jpg`, sizes: '1200x630', type: 'image/jpeg' }
    ];

    const metadataInit = { title, artist, album, artwork };
    navigator.mediaSession.metadata = typeof MediaMetadata === 'function'
      ? new MediaMetadata(metadataInit)
      : metadataInit;
  } catch {
    // Ignore unsupported MediaMetadata implementations
  }

  if (typeof navigator.mediaSession.setActionHandler !== 'function') return;

  const setHandler = (action, handler) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch {
      // Action may not be supported by this browser
    }
  };

  setHandler('play', () => {
    invokeAudioPlay(narrationAudio);
  });

  setHandler('pause', () => {
    try {
      narrationAudio.pause();
    } catch {}
  });

  setHandler('seekto', (details) => {
    if (!details || typeof details.seekTime !== 'number' || isNaN(details.seekTime)) return;
    const dur = narrationAudio.duration;
    const clamped = (typeof dur === 'number' && !isNaN(dur) && isFinite(dur) && dur > 0)
      ? Math.max(0, Math.min(dur, details.seekTime))
      : Math.max(0, details.seekTime);
    narrationAudio.currentTime = clamped;
    if (dur > 0 && updateProgressVisual) {
      updateProgressVisual((clamped / dur) * 100);
    }
  });

  const prevLink = container?.querySelector('a#prev-btn[href]');
  const nextLink = container?.querySelector('a#next-btn[href]');
  const prevSlug = options.prevSlug || '';
  const nextSlug = options.nextSlug || '';
  const hasPrev = Boolean(prevSlug || prevLink);
  const hasNext = Boolean(nextSlug || nextLink);

  setHandler('previoustrack', hasPrev ? () => {
    if (typeof options.onNavigate === 'function' && prevSlug) {
      options.onNavigate(prevSlug);
    } else if (prevLink && typeof prevLink.click === 'function') {
      prevLink.click();
    }
  } : null);

  setHandler('nexttrack', hasNext ? () => {
    if (typeof options.onNavigate === 'function' && nextSlug) {
      options.onNavigate(nextSlug);
    } else if (nextLink && typeof nextLink.click === 'function') {
      nextLink.click();
    }
  } : null);
}

function setMediaSessionPlaybackState(state) {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
  try {
    navigator.mediaSession.playbackState = state;
  } catch {}
}

function clearMediaSession() {
  if (typeof navigator === 'undefined' || !navigator.mediaSession) return;
  setMediaSessionPlaybackState('none');
  if (typeof navigator.mediaSession.setActionHandler === 'function') {
    ['play', 'pause', 'seekto', 'previoustrack', 'nexttrack'].forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {}
    });
  }
}

export const AudioPlayer = {
  init(container, baseUrl = '/', options = {}) {
    if (!container) return;
    const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

    // Ambient Audio Logic
    const ambientBtns = container.querySelectorAll('.ambient-btn');
    const ambientAudio = document.getElementById('ambient-audio');

    const sounds = {
      rain: `${normalizedBase}sounds/rain.mp3`,
      fire: `${normalizedBase}sounds/fire.mp3`
    };

    const setActiveAmbientBtn = (targetSound) => {
      const normalized = normalizeAmbientMode(targetSound);
      ambientBtns.forEach(b => b.classList.remove('active'));
      const activeBtn = container.querySelector(`.ambient-btn[data-sound="${normalized}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
      ambientBtns.forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset.sound === normalized ? 'true' : 'false');
      });
    };

    const pauseAmbientAndShowSilence = () => {
      if (ambientAudio) {
        try {
          ambientAudio.pause();
          ambientAudio.currentTime = 0;
        } catch {}
      }
      setActiveAmbientBtn('silence');
    };

    markAmbientOfflineAvailability(container, sounds);

    ambientBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = normalizeAmbientMode(btn.dataset.sound);
        const isCurrentlyActive = btn.classList.contains('active');

        // If clicking already active sound (rain/fire), switch back to silence
        if (isCurrentlyActive && sound !== 'silence') {
          setStorageItem(AUDIO_PREF_KEYS.ambientMode, 'silence');
          pauseAmbientAndShowSilence();
          return;
        }

        setStorageItem(AUDIO_PREF_KEYS.ambientMode, sound);
        setActiveAmbientBtn(sound);

        if (!ambientAudio) return;

        if (sound === 'silence') {
          pauseAmbientAndShowSilence();
        } else if (sounds[sound]) {
          const soundSrc = sounds[sound];
          if (!ambientAudio.src || !ambientAudio.src.endsWith(soundSrc)) {
            ambientAudio.src = soundSrc;
          }
          ambientAudio.volume = 0.5;
          invokeAudioPlay(ambientAudio, null, (err) => {
            pauseAmbientAndShowSilence();
            if (isAutoplayBlockedError(err)) {
              return;
            }
            if (typeof navigator !== 'undefined' && navigator.onLine === false) {
              import('./toast.js').then(({ toast }) => {
                toast.show('A reprodução de som ambiente requer conexão com a internet ou cache prévio.', 'info');
              }).catch(() => {});
            } else {
              console.warn('Ambient audio play failed:', err);
            }
          });
        }
      });
    });

    // Restore persisted ambient preference (CA01, CA02)
    const savedAmbient = normalizeAmbientMode(getStorageItem(AUDIO_PREF_KEYS.ambientMode, 'silence'));
    if (savedAmbient !== 'silence' && ambientAudio && sounds[savedAmbient]) {
      const soundSrc = sounds[savedAmbient];
      if (!ambientAudio.src || !ambientAudio.src.endsWith(soundSrc)) {
        ambientAudio.src = soundSrc;
      }
      ambientAudio.volume = 0.5;
      setActiveAmbientBtn(savedAmbient);
      invokeAudioPlay(ambientAudio, null, () => {
        // CA02: Autoplay blocked or unavailable -> reflect paused/ready state without throwing/reporting
        pauseAmbientAndShowSilence();
      });
    } else {
      setActiveAmbientBtn('silence');
    }

    // Narration Audio Player Logic
    const narrationAudio = document.getElementById('narration-audio');
    const narrationPlayBtn = document.getElementById('narration-play-btn');
    const narrationPlayIcon = document.getElementById('narration-play-icon');
    const narrationPauseIcon = document.getElementById('narration-pause-icon');
    const narrationCurrentTime = document.getElementById('narration-current-time');
    const narrationDuration = document.getElementById('narration-duration');
    const narrationProgress = document.getElementById('narration-progress');
    const narrationSpeedBtn = document.getElementById('narration-speed-btn');
    const narrationMuteBtn = document.getElementById('narration-mute-btn');
    const narrationVolIconOn = document.getElementById('narration-vol-icon-on');
    const narrationVolIconOff = document.getElementById('narration-vol-icon-off');
    const narrationVolSlider = document.getElementById('narration-vol-slider');

    if (narrationAudio && narrationPlayBtn) {
      const formatTime = (secs) => {
        if (!secs || isNaN(secs) || !isFinite(secs)) return '00:00';
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      };

      const updateProgressVisual = (pct) => {
        if (narrationProgress) {
          const clamped = Math.max(0, Math.min(100, pct));
          narrationProgress.value = clamped;
          narrationProgress.style.background = `linear-gradient(to right, var(--accent-subtle) ${clamped}%, var(--border-strong) ${clamped}%)`;
        }
      };

      const updatePlayState = (isPlaying) => {
        if (isPlaying) {
          if (narrationPlayIcon) narrationPlayIcon.style.display = 'none';
          if (narrationPauseIcon) narrationPauseIcon.style.display = 'block';
          narrationPlayBtn.setAttribute('aria-label', 'Pausar narração');
        } else {
          if (narrationPlayIcon) narrationPlayIcon.style.display = 'block';
          if (narrationPauseIcon) narrationPauseIcon.style.display = 'none';
          narrationPlayBtn.setAttribute('aria-label', 'Reproduzir narração');
        }
      };

      // Speed Control & Restoration (RF01, CA01)
      const savedSpeed = parsePlaybackRate(getStorageItem(AUDIO_PREF_KEYS.playbackRate, '1'));
      let currentSpeedIdx = Math.max(0, VALID_PLAYBACK_RATES.indexOf(savedSpeed));
      const applySpeed = (rate) => {
        narrationAudio.playbackRate = rate;
        if (narrationSpeedBtn) {
          narrationSpeedBtn.textContent = `${rate}x`;
        }
      };
      applySpeed(VALID_PLAYBACK_RATES[currentSpeedIdx]);

      if (narrationSpeedBtn) {
        narrationSpeedBtn.addEventListener('click', () => {
          currentSpeedIdx = (currentSpeedIdx + 1) % VALID_PLAYBACK_RATES.length;
          const newSpeed = VALID_PLAYBACK_RATES[currentSpeedIdx];
          applySpeed(newSpeed);
          setStorageItem(AUDIO_PREF_KEYS.playbackRate, String(newSpeed));
        });
      }

      // Volume / Mute & Restoration (RF01, CA01)
      const updateVolumeState = () => {
        const isMuted = narrationAudio.muted || narrationAudio.volume === 0;
        if (narrationVolIconOn) narrationVolIconOn.style.display = isMuted ? 'none' : 'block';
        if (narrationVolIconOff) narrationVolIconOff.style.display = isMuted ? 'block' : 'none';
      };

      const savedVolume = parseVolume(getStorageItem(AUDIO_PREF_KEYS.volume, '1'));
      const savedMuted = getStorageItem(AUDIO_PREF_KEYS.muted, 'false') === 'true';
      narrationAudio.volume = savedVolume;
      narrationAudio.muted = savedMuted || savedVolume === 0;
      if (narrationVolSlider) {
        narrationVolSlider.value = String(narrationAudio.muted ? 0 : narrationAudio.volume);
      }
      updateVolumeState();

      if (narrationMuteBtn) {
        narrationMuteBtn.addEventListener('click', () => {
          const nextMuted = !narrationAudio.muted;
          narrationAudio.muted = nextMuted;
          if (!nextMuted && narrationAudio.volume === 0) {
            narrationAudio.volume = 1;
            setStorageItem(AUDIO_PREF_KEYS.volume, '1');
          }
          setStorageItem(AUDIO_PREF_KEYS.muted, String(narrationAudio.muted));
          updateVolumeState();
          if (narrationVolSlider) {
            narrationVolSlider.value = String(narrationAudio.muted ? 0 : narrationAudio.volume);
          }
        });
      }

      if (narrationVolSlider) {
        narrationVolSlider.addEventListener('input', (e) => {
          const vol = parseVolume(e.target.value);
          narrationAudio.volume = vol;
          narrationAudio.muted = vol === 0;
          setStorageItem(AUDIO_PREF_KEYS.volume, String(vol));
          setStorageItem(AUDIO_PREF_KEYS.muted, String(narrationAudio.muted));
          updateVolumeState();
        });
      }

      const activateMediaSession = () => {
        setupMediaSession({
          container,
          baseUrl: normalizedBase,
          narrationAudio,
          updateProgressVisual,
          options
        });
      };

      // Play/Pause
      narrationPlayBtn.addEventListener('click', () => {
        if (narrationAudio.paused) {
          if (typeof navigator !== 'undefined' && navigator.onLine === false && !narrationAudio.duration) {
            import('./toast.js').then(({ toast }) => {
              toast.show('A reprodução da narração requer conexão com a internet.', 'info');
            }).catch(() => {});
            return;
          }
          activateMediaSession();
          invokeAudioPlay(narrationAudio, () => {
            updatePlayState(true);
            setMediaSessionPlaybackState('playing');
          }, (err) => {
            updatePlayState(false);
            setMediaSessionPlaybackState('paused');
            if (isAutoplayBlockedError(err)) {
              return;
            }
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
              import('./toast.js').then(({ toast }) => {
                toast.show('A reprodução da narração requer conexão com a internet.', 'info');
              }).catch(() => {});
            } else {
              console.warn('Narration play error:', err);
            }
          });
        } else {
          narrationAudio.pause();
        }
      });

      // Audio Event Listeners
      narrationAudio.addEventListener('play', () => {
        applySpeed(VALID_PLAYBACK_RATES[currentSpeedIdx]);
        activateMediaSession();
        updatePlayState(true);
        setMediaSessionPlaybackState('playing');
      });

      narrationAudio.addEventListener('pause', () => {
        updatePlayState(false);
        setMediaSessionPlaybackState('paused');
      });

      narrationAudio.addEventListener('ended', () => {
        updatePlayState(false);
        updateProgressVisual(0);
        if (narrationCurrentTime) narrationCurrentTime.textContent = '00:00';
        setMediaSessionPlaybackState('paused');
      });

      narrationAudio.addEventListener('loadedmetadata', () => {
        applySpeed(VALID_PLAYBACK_RATES[currentSpeedIdx]);
        if (narrationDuration) {
          narrationDuration.textContent = formatTime(narrationAudio.duration);
        }
      });

      narrationAudio.addEventListener('timeupdate', () => {
        const cur = narrationAudio.currentTime;
        const dur = narrationAudio.duration;
        if (narrationCurrentTime) narrationCurrentTime.textContent = formatTime(cur);
        if (dur > 0) {
          updateProgressVisual((cur / dur) * 100);
        }
      });

      // Progress Slider Interaction
      if (narrationProgress) {
        narrationProgress.addEventListener('input', (e) => {
          const pct = parseFloat(e.target.value);
          const dur = narrationAudio.duration;
          if (dur && !isNaN(dur)) {
            narrationAudio.currentTime = (pct / 100) * dur;
          }
          updateProgressVisual(pct);
        });
      }
    }
  },

  cleanup() {
    const ambientAudio = document.getElementById('ambient-audio');
    if (ambientAudio) {
      ambientAudio.pause();
      ambientAudio.removeAttribute('src');
      ambientAudio.load();
    }

    const narrationAudio = document.getElementById('narration-audio');
    if (narrationAudio) {
      narrationAudio.pause();
      narrationAudio.removeAttribute('src');
      narrationAudio.load();
    }

    clearMediaSession();
  }
};
