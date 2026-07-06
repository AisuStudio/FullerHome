import styles from "./SiteFooter.module.css";

/** Shared footer across all pages, carrying the experiment caveat. */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.caveat}>
          <strong>This is an experiment in progress: </strong>
          a WebGL simulation, not an engineering or legal tool. It (still) makes
          no claim to accuracy.
        </p>
        <div className={styles.meta}>
          <span>FullerHome — WebGL spike</span>
          <span>Next.js · three.js · React Three Fiber · Zustand</span>
        </div>
      </div>
    </footer>
  );
}
