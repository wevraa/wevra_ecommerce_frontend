import Image from "next/image";
import styles from "./MeasurementModel.module.scss";

import measurementModal from "../../app/assests/icons/modal.svg";

export default function MeasurementModel() {
  return (
    <div className={styles.wrap}>
      <div className={styles.scrollHint} aria-label="Scroll ruler to select value">
        <span className={styles.scrollHintArrow} aria-hidden>←</span>
        <span className={styles.scrollHintText}>Scroll to Select</span>
      </div>
      <div className={styles.imageWrap}>
        <Image
          src={measurementModal}
          alt="Body measurement guide with 3D model"
          width={280}
          height={373}
          className={styles.image}
          priority
        />
      </div>
    </div>
  );
}
