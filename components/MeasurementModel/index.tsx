import Image from "next/image";
import styles from "./MeasurementModel.module.scss";

import measurementModal from "../../app/assests/icons/modal.svg";

export default function MeasurementModel() {
  return (
    <div className={styles.wrap}>
      <div className={styles.imageWrap}>
        <Image
          src={measurementModal}
          alt="Body measurement guide with 3D model"
          width={280}
          height={373}
          className={styles.image}
        />
      </div>
    </div>
  );
}
