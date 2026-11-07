# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Detect the horizontal reference system in compound WKT2 definitions that use the long keywords (e.g. `PROJECTEDCRS`)

## [0.1.1] - 2026-11-07

### Changed

- The package is published with npm provenance

## [0.1.0] - 2026-11-06

### Added

- First release: `COPCSource` and `COPCLayer` to render Cloud Optimized Point Clouds (COPC) with WebGL 2,
  top-down or in a tilted (oblique) view that follows the rotation of the map,
  colored by RGB, classification, elevation or intensity

[Unreleased]: <https://github.com/moregeo-it/ol-copc/compare/v0.1.1...HEAD>
[0.1.1]: <https://github.com/moregeo-it/ol-copc/compare/v0.1.0...v0.1.1>
[0.1.0]: <https://github.com/moregeo-it/ol-copc/releases/tag/v0.1.0>
