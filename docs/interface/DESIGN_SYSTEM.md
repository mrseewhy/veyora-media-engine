# Veyora Interface Design System

## Direction
Professional, cinematic production console, not a generic AI chat clone. Dense enough for operations but readable; visual priority on preview, timeline and production status. Design identity for Veyora while supporting ToolPilot channel branding.

## Tokens (proposed, confirm against existing brand assets)
Dark default: background #0B0F17, surface #151B27, elevated #202838, text #F5F7FB, muted #A3AEC2, accent #6D8BFF, success #39C99A, warning #F5B84B, error #F16D79. Light: background #F6F8FC, surface #FFFFFF, text #182234, border #DFE5EF. All tokens centralized and replaceable.

## Typography and layout
System sans or Geist; monospace for timestamps, model IDs and logs. 8px spacing rhythm; 240px desktop sidebar; responsive top navigation on mobile. Use accessible contrast and keyboard navigation.

## Screens
Dashboard: pipeline overview and active jobs. Episodes: filterable list and statuses. Studio: preview center, episode stages left, properties and generation controls right. Models: Ollama connection, available models, task assignments and test prompt. Media Library: voice presets, audio, music, intros, outros, logos and template versions.

## Components
Sidebar, breadcrumbs, status chip, progress stepper, job log, script editor, video preview, asset picker, model selector, confirmation dialog, error banner and toast.

## Behavior
Never hide render errors; require confirmation before overwriting approved assets; show exact current voice preset and model choice. Support reduced motion and dark/light toggle.
