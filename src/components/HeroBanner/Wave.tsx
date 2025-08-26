import styles from "./index.module.scss";

export default function Wave() {
  return (
    <div className={styles.waveContainer}>
      <svg
        className={styles.waveSvg}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 24 150 40"
        preserveAspectRatio="none"
      >
        <defs>
          <path id="wave-path" d="M-160 44c30 0 58-22 88-22s 58 22 88 22 58-22 88-22 58 22 88 22 v44h-352z" />
          <linearGradient id="lightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor="white" />
          </linearGradient>
          <linearGradient id="darkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(17, 24, 39, 0.6)" />
            <stop offset="50%" stopColor="rgba(17, 24, 39, 0.8)" />
            <stop offset="100%" stopColor="rgb(17, 24, 39)" />
          </linearGradient>
        </defs>
        <g>
          <use xlinkHref="#wave-path" x="50" y="8" className={`${styles.waveSlow} ${styles.waveMain}`} />
          <use xlinkHref="#wave-path" x="50" y="4" className={`${styles.waveMedium} ${styles.waveGradient}`} />
          <use xlinkHref="#wave-path" x="50" y="0" className={`${styles.waveFast} ${styles.waveSecondary}`} />
        </g>
      </svg>
    </div>
  );
}
