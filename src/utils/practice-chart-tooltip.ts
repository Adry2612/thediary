const TOOLTIP_WIDTH = 176;
const TOOLTIP_HEIGHT = 56;
const TOOLTIP_INSET = 8;

export function getContainedTooltipPosition(
  anchorX: number,
  anchorY: number,
  containerWidth: number,
  containerHeight: number,
) {
  const maximumLeft = Math.max(
    TOOLTIP_INSET,
    containerWidth - TOOLTIP_WIDTH - TOOLTIP_INSET,
  );
  const maximumTop = Math.max(
    TOOLTIP_INSET,
    containerHeight - TOOLTIP_HEIGHT - TOOLTIP_INSET,
  );

  return {
    left: Math.max(
      TOOLTIP_INSET,
      Math.min(anchorX - TOOLTIP_WIDTH / 2, maximumLeft),
    ),
    top: Math.max(
      TOOLTIP_INSET,
      Math.min(anchorY - TOOLTIP_HEIGHT - TOOLTIP_INSET, maximumTop),
    ),
  };
}
