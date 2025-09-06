import styles from "./index.module.scss";

interface ArticleListSkeletonProps {
  count?: number;
}

const ArticleSkeletonCard = ({ mode }: { mode: "normal" | "reverse" }) => {
  const renderImageSkeleton = () => (
    <div
      className={`${styles.imageSkeleton} ${
        mode === "reverse" ? styles.imageSkeletonReverse : styles.imageSkeletonNormal
      }`}
    />
  );

  const renderContentSkeleton = () => (
    <div className={styles.contentSkeleton}>
      {/* Title skeleton */}
      <div className={styles.titleSkeleton} />

      {/* Content skeleton */}
      <div className={styles.contentLines}>
        <div className={`${styles.contentLine} ${styles.contentLineFull}`} />
        <div className={`${styles.contentLine} ${styles.contentLineMedium}`} />
        <div className={`${styles.contentLine} ${styles.contentLineSmall}`} />
      </div>

      {/* Other info skeleton */}
      <div className={styles.infoSkeleton}>
        {[1, 2, 3].map((item) => (
          <div key={item} className={styles.infoItem}>
            <div className={styles.infoIcon} />
            <div className={styles.infoText} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.skeletonCard}>
      {/* Background blur effect skeleton */}
      <div className={styles.backgroundSkeleton} />

      {mode === "normal" && renderImageSkeleton()}
      {renderContentSkeleton()}
      {mode === "reverse" && renderImageSkeleton()}

      {/* Shimmer overlay */}
      <div className={styles.shimmerOverlay} />
    </div>
  );
};

const ArticleListSkeleton = ({ count = 4 }: ArticleListSkeletonProps) => {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: count }, (_, index) => (
        <ArticleSkeletonCard key={`skeleton-${index}`} mode={index % 2 === 0 ? "normal" : "reverse"} />
      ))}
    </div>
  );
};

export default ArticleListSkeleton;
