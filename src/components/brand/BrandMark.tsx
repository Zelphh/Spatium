import appIcon from "../../../src-tauri/icons/128x128.png";

interface BrandMarkProps {
  size?: number;
}

/** Logotipo do Spatium: o mesmo ícone usado pelo aplicativo (src-tauri/icons). */
export function BrandMark({ size = 40 }: BrandMarkProps) {
  return (
    <img
      src={appIcon}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{ flex: "none", marginLeft: 2 }}
    />
  );
}
