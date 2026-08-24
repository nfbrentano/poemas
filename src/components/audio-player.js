export const AudioPlayer = {
  init(container, baseUrl) {
    // Ambient Audio Logic
    const ambientBtns = container.querySelectorAll('.ambient-btn');
    const ambientAudio = document.getElementById('ambient-audio');
    
    const sounds = {
      rain: `${baseUrl}sounds/rain.mp3`,
      fire: `${baseUrl}sounds/fire.mp3`
    };

    ambientBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sound = btn.dataset.sound;
        const isCurrentlyActive = btn.classList.contains('active');

        // If clicking already active sound (rain/fire), switch back to silence
        if (isCurrentlyActive && sound !== 'silence') {
          ambientBtns.forEach(b => b.classList.remove('active'));
          const silenceBtn = container.querySelector('.ambient-btn[data-sound="silence"]');
          if (silenceBtn) silenceBtn.classList.add('active');
          if (ambientAudio) {
            ambientAudio.pause();
            ambientAudio.currentTime = 0;
          }
          return;
        }

        ambientBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (!ambientAudio) return;

        if (sound === 'silence') {
          ambientAudio.pause();
          ambientAudio.currentTime = 0;
        } else if (sounds[sound]) {
          const soundSrc = sounds[sound];
          if (!ambientAudio.src.endsWith(soundSrc)) {
            ambientAudio.src = soundSrc;
          }
          ambientAudio.volume = 0.5;
          ambientAudio.play().catch(e => console.error('Audio play failed:', e));
        }
      });
    });
    
    // Set initial active state for audio
    const initialSilenceBtn = container.querySelector('.ambient-btn[data-sound="silence"]');
    if (initialSilenceBtn) initialSilenceBtn.classList.add('active');

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

      // Play/Pause
      narrationPlayBtn.addEventListener('click', () => {
        if (narrationAudio.paused) {
          narrationAudio.play().catch(e => console.error('Narration play error:', e));
        } else {
          narrationAudio.pause();
        }
      });

      // Audio Event Listeners
      narrationAudio.addEventListener('play', () => updatePlayState(true));
      narrationAudio.addEventListener('pause', () => updatePlayState(false));
      narrationAudio.addEventListener('ended', () => {
        updatePlayState(false);
        updateProgressVisual(0);
        if (narrationCurrentTime) narrationCurrentTime.textContent = '00:00';
      });

      narrationAudio.addEventListener('loadedmetadata', () => {
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

      // Speed Control
      const speeds = [1, 1.25, 1.5, 2];
      let currentSpeedIdx = 0;
      if (narrationSpeedBtn) {
        narrationSpeedBtn.addEventListener('click', () => {
          currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
          const newSpeed = speeds[currentSpeedIdx];
          narrationAudio.playbackRate = newSpeed;
          narrationSpeedBtn.textContent = `${newSpeed}x`;
        });
      }

      // Volume / Mute
      const updateVolumeState = () => {
        const isMuted = narrationAudio.muted || narrationAudio.volume === 0;
        if (narrationVolIconOn) narrationVolIconOn.style.display = isMuted ? 'none' : 'block';
        if (narrationVolIconOff) narrationVolIconOff.style.display = isMuted ? 'block' : 'none';
      };

      if (narrationMuteBtn) {
        narrationMuteBtn.addEventListener('click', () => {
          narrationAudio.muted = !narrationAudio.muted;
          updateVolumeState();
          if (narrationVolSlider) {
            narrationVolSlider.value = narrationAudio.muted ? 0 : narrationAudio.volume;
          }
        });
      }

      if (narrationVolSlider) {
        narrationVolSlider.addEventListener('input', (e) => {
          const vol = parseFloat(e.target.value);
          narrationAudio.volume = vol;
          narrationAudio.muted = vol === 0;
          updateVolumeState();
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
  }
};
