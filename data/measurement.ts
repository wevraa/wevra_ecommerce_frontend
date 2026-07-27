export interface MeasurementItem {
  id: string;
  name: string;
  value: number;
  unit?: string;
  imageUrl?: string;
}

export const defaultSize = "XS";

export const measurementItems: MeasurementItem[] = [
  { id: "1", name: "Full Length", value: 13.25 },
  { id: "2", name: "Shoulder", value: 21.75 },
  { id: "3", name: "Chest Round", value: 32.0 },
  { id: "4", name: "Waist Round", value: 28.25 },
  { id: "5", name: "Waist Band Length", value: 28.75 },
  { id: "6", name: "Sleeves Length", value: 18.0 },
  { id: "7", name: "Sleeves Round", value: 8.25 },
  { id: "8", name: "Arm Hole Round", value: 21.25 },
  { id: "9", name: "Front Neck Deep", value: 23.25 },
  { id: "10", name: "Back Neck Deep", value: 23.25 },
  { id: "11", name: "Neck Width", value: 23.25 },
  { id: "12", name: "Bust Point", value: 23.25 },
];
