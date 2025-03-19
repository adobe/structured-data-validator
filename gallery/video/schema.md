# Entities and Attributes

## VideoObject
**Required Attributes:**
- name (Text) – Title of the video.
- thumbnailUrl (URL) – URL of the video thumbnail image.
- uploadDate (DateTime) – ISO 8601 formatted date and time of video publication.

**Recommended Attributes:**
- contentUrl (URL) – Direct URL to the video file.
- description (Text) – Short description of the video.
- duration (Duration) – Video length in ISO 8601 format.
- embedUrl (URL) – URL of the embedded video player.
- expires (DateTime) – Expiration date of the video (if applicable).
- hasPart (Clip) – Nested Clip elements to define key moments.
- interactionStatistic (InteractionCounter) – Number of views.
- ineligibleRegion (Place) – Regions where the video is restricted.
- publication (BroadcastEvent) – Information on live-streamed videos.
- regionsAllowed (Place) – Regions where the video is available.

---

## Clip
**Required Attributes:**
- name (Text) – Title of the clip.
- startOffset (Number) – Start time in seconds from the beginning of the video.
- url (URL) – URL pointing to the clip's start time.

**Recommended Attributes:**
- endOffset (Number) – End time in seconds.

---

## BroadcastEvent
**Required Attributes:**
- startDate (DateTime) – Start time of the live stream.
- endDate (DateTime) – End time of the live stream.
- isLiveBroadcast (Boolean) – Indicates if the video is live.

---

## SeekToAction
**Required Attributes:**
- potentialAction (SeekToAction) – Defines how Google should interpret timestamp URLs.
- potentialAction.startOffset-input (Text) – Placeholder for timestamp structure.
- potentialAction.target (EntryPoint) – URL structure with a placeholder for timestamps.

---

# Schema Rules
- `VideoObject` must include `name`, `thumbnailUrl`, and `uploadDate` to be valid.
- `contentUrl` or `embedUrl` must be provided for Google to fetch the video.
- `Clip` elements must not have overlapping `startOffset` values for the same video.
- `SeekToAction` should be used only when Google can parse timestamp-based URLs.
- `BroadcastEvent` must include `startDate`, and once the stream ends, `endDate` must be updated.
- `regionsAllowed` and `ineligibleRegion` are mutually exclusive; only one should be used.