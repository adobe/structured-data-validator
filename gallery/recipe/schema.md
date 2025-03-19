# Entities and Attributes

## Recipe
**Required Attributes:**
- name (Text) – Name of the dish.
- image (URL/ImageObject) – Image of the completed dish.
  
**Recommended Attributes:**
- aggregateRating (AggregateRating) – Average review score.
- author (Person/Organization) – Creator of the recipe.
- cookTime (Duration) – Cooking time in ISO 8601 format.
- datePublished (Date) – Date the recipe was published.
- description (Text) – Short summary of the dish.
- keywords (Text) – Related terms such as season, holiday, etc.
- nutrition (NutritionInformation) – Nutritional data (e.g., calories).
- prepTime (Duration) – Time required to prepare ingredients.
- recipeCategory (Text) – Type of meal (e.g., dinner, dessert).
- recipeCuisine (Text) – Cuisine type (e.g., Italian, French).
- recipeIngredient (Text) – List of ingredients.
- recipeInstructions (HowToStep/HowToSection/Text) – Step-by-step instructions.
- recipeYield (Text/Integer) – Number of servings.
- totalTime (Duration) – Total time required (prep + cook).
- video (VideoObject) – Video tutorial.

---

## ItemList (For recipe collections)
**Required Attributes:**
- itemListElement (ListItem) – Items in the list.
- position (Integer) – Order of the item in the list.
- url (URL) – Canonical URL of the item.

---

## HowToStep
**Required Attributes:**
- text (Text) – Instructional text.

**Recommended Attributes:**
- image (ImageObject/URL) – Step image.
- name (Text) – Summary of the step.
- url (URL) – Link to the step.
- video (VideoObject) – Step-specific video.

---

## HowToSection
**Required Attributes:**
- itemListElement (HowToStep) – List of steps in the section.
- name (Text) – Name of the section.

---

# Schema Rules
- `recipeYield` is required if `nutrition.calories` is provided.
- `prepTime` must be used with `cookTime` when applicable.
- `recipeInstructions` should use `HowToStep` for better structuring.
- `keywords` should not duplicate `recipeCategory` or `recipeCuisine`.
- `image` must be crawlable and indexable by Google.
- `HowToSection` should only be used for grouping steps, not for listing multiple recipe variations.