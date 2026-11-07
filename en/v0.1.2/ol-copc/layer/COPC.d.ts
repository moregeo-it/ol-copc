export default COPCLayer;
export type ColorMode = "rgb" | "classification" | "elevation" | "intensity";
export type Options = {
    /**
     * The COPC source.
     */
    source: import("../source/COPC.js").default;
    /**
     * The tilt of the view in degrees, up to 75.
     * Points are shifted towards the top of the screen by their height above the ground (oblique view).
     */
    tilt?: number | undefined;
    /**
     * The elevation that is not shifted by the tilt.
     * Estimated from the point cloud by default.
     */
    groundElevation?: number | undefined;
    /**
     * The size of the points in CSS pixels.
     * The level of detail is chosen so that the points are about this far apart.
     */
    pointSize?: number | undefined;
    /**
     * The maximum number of points to render.
     */
    pointBudget?: number | undefined;
    /**
     * The maximum number of points kept on the GPU.
     */
    maxLoadedPoints?: number | undefined;
    /**
     * How to color the points. Defaults to `rgb` if the points have colors,
     * `elevation` otherwise.
     */
    colorMode?: ColorMode | undefined;
    /**
     * The colors per class.
     * Defaults to the colors of the ASPRS standard classes.
     */
    classColors?: {
        [x: number]: string | import("ol/color.js").Color;
    } | undefined;
    /**
     * The colors for elevations and intensities.
     */
    colormap?: (string | import("ol/color.js").Color)[] | undefined;
    /**
     * The [min, max] range of elevations for the colormap.
     * Estimated from the point cloud by default.
     */
    elevationRange?: number[] | undefined;
    /**
     * The [min, max] range of intensities for the colormap.
     * Estimated from the point cloud by default.
     */
    intensityRange?: number[] | undefined;
    /**
     * The strength of the eye-dome lighting (0 disables it).
     */
    edl?: number | undefined;
    /**
     * Whether to draw walls below elevated points in the oblique view.
     */
    walls?: boolean | undefined;
    /**
     * Whether points are shaded as domes.
     */
    shading?: boolean | undefined;
    /**
     * A CSS class name to set to the layer element.
     */
    className?: string | undefined;
    /**
     * Opacity (0, 1).
     */
    opacity?: number | undefined;
    /**
     * Visibility.
     */
    visible?: boolean | undefined;
    /**
     * The bounding extent for layer rendering.
     */
    extent?: import("ol/extent.js").Extent | undefined;
    /**
     * The z-index for layer rendering.
     */
    zIndex?: number | undefined;
    /**
     * The minimum resolution (inclusive) at which this layer will be visible.
     */
    minResolution?: number | undefined;
    /**
     * The maximum resolution (exclusive) below which this layer will be visible.
     */
    maxResolution?: number | undefined;
    /**
     * The minimum view zoom level (exclusive) above which this layer will be visible.
     */
    minZoom?: number | undefined;
    /**
     * The maximum view zoom level (inclusive) at which this layer will be visible.
     */
    maxZoom?: number | undefined;
    /**
     * Arbitrary observable properties.
     */
    properties?: {
        [x: string]: any;
    } | undefined;
};
/**
 * @classdesc
 * A layer that renders a Cloud Optimized Point Cloud (COPC) with WebGL 2,
 * top-down or in an oblique (tilted) view that follows the rotation of the map.
 * @extends {Layer<import("../source/COPC.js").default, COPCLayerRenderer>}
 * @api
 */
declare class COPCLayer extends Layer<import("../source/COPC.js").default, COPCLayerRenderer, {
    [x: string]: any;
}> {
    /**
     * @param {Options} options The options.
     */
    constructor(options: Options);
    /**
     * @type {number}
     * @private
     */
    private tilt_;
    /**
     * @type {number|undefined}
     * @private
     */
    private groundElevation_;
    /**
     * @type {number}
     * @private
     */
    private pointSize_;
    /**
     * @type {number}
     * @private
     */
    private pointBudget_;
    /**
     * @type {number}
     * @private
     */
    private maxLoadedPoints_;
    /**
     * @type {ColorMode|undefined}
     * @private
     */
    private colorMode_;
    /**
     * @type {Object<number, import("ol/color.js").Color|string>|undefined}
     * @private
     */
    private classColors_;
    /**
     * @type {Array<import("ol/color.js").Color|string>|undefined}
     * @private
     */
    private colormap_;
    /**
     * @type {Array<number>|undefined}
     * @private
     */
    private elevationRange_;
    /**
     * @type {Array<number>|undefined}
     * @private
     */
    private intensityRange_;
    /**
     * @type {number}
     * @private
     */
    private edl_;
    /**
     * @type {boolean}
     * @private
     */
    private walls_;
    /**
     * @type {boolean}
     * @private
     */
    private shading_;
    /**
     * @return {number} The tilt of the view in degrees.
     * @api
     */
    getTilt(): number;
    /**
     * @param {number} tilt The tilt of the view in degrees, up to 75.
     * @api
     */
    setTilt(tilt: number): void;
    /**
     * @return {number|undefined} The elevation that is not shifted by the tilt, if set.
     * @api
     */
    getGroundElevation(): number | undefined;
    /**
     * @return {number} The size of the points in CSS pixels.
     * @api
     */
    getPointSize(): number;
    /**
     * @param {number} pointSize The size of the points in CSS pixels.
     * @api
     */
    setPointSize(pointSize: number): void;
    /**
     * @return {number} The maximum number of points to render.
     * @api
     */
    getPointBudget(): number;
    /**
     * @return {number} The maximum number of points kept on the GPU.
     * @api
     */
    getMaxLoadedPoints(): number;
    /**
     * @return {ColorMode} How the points are colored.
     * @api
     */
    getColorMode(): ColorMode;
    /**
     * @param {ColorMode} colorMode How to color the points.
     * @api
     */
    setColorMode(colorMode: ColorMode): void;
    /**
     * @return {Object<number, import("ol/color.js").Color|string>|undefined} The colors per class, if set.
     * @api
     */
    getClassColors(): {
        [x: number]: import("ol/color.js").Color | string;
    } | undefined;
    /**
     * @return {Array<import("ol/color.js").Color|string>|undefined} The colors for elevations and intensities, if set.
     * @api
     */
    getColormap(): Array<import("ol/color.js").Color | string> | undefined;
    /**
     * @return {Array<number>|undefined} The range of elevations for the colormap, if set.
     * @api
     */
    getElevationRange(): Array<number> | undefined;
    /**
     * @return {Array<number>|undefined} The range of intensities for the colormap, if set.
     * @api
     */
    getIntensityRange(): Array<number> | undefined;
    /**
     * @return {number} The strength of the eye-dome lighting.
     * @api
     */
    getEDL(): number;
    /**
     * @param {number} edl The strength of the eye-dome lighting (0 disables it).
     * @api
     */
    setEDL(edl: number): void;
    /**
     * @return {boolean} Whether walls are drawn in the oblique view.
     * @api
     */
    getWalls(): boolean;
    /**
     * @param {boolean} walls Whether to draw walls below elevated points in the oblique view.
     * @api
     */
    setWalls(walls: boolean): void;
    /**
     * @return {boolean} Whether points are shaded as domes.
     * @api
     */
    getShading(): boolean;
}
import COPCLayerRenderer from '../renderer/COPCLayer.js';
import Layer from 'ol/layer/Layer.js';
//# sourceMappingURL=COPC.d.ts.map