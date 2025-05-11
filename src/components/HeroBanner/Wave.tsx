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
        </defs>
        <g>
          <use xlinkHref="#wave-path" x="50" y="0" fill="rgba(35,41,49,0.9)" className={styles.waveSlow} />
          <use xlinkHref="#wave-path" x="50" y="4" fill="rgba(35,41,49,0.9)" className={styles.waveFast} />
        </g>
      </svg>
    </div>
  );
}
