# Entities and Attributes

## BreadcrumbList
**Required Attributes:**
- itemListElement (ListItem) – Array of breadcrumbs listed in order.

---

## ListItem
**Required Attributes:**
- name (Text) – Display title of the breadcrumb.
- position (Integer) – Position of the breadcrumb in the trail.
- item (URL/Thing) – URL to the webpage representing the breadcrumb (optional for the last item).

---

# Schema Rules
- A `BreadcrumbList` must contain at least two `ListItem` elements.
- The `position` attribute must start from `1` and be sequential.
- The `item` attribute is optional for the last breadcrumb in the trail.
- The breadcrumb path should represent a typical user navigation path rather than the URL structure.
- The breadcrumb trail must not use `data-vocabulary.org` markup, as it is no longer supported for rich results.