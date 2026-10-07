# Shimla seed research notes

Checked 2026-10-08. This is a small source-backed sample, not a representative hotel market survey or a live travel guide. All pages below were opened during research. Hotel pages and the HPTDC itinerary page did not show a reliable publication/update date, so their `sourceDate` is `null`. The Himachal Tourism pages expose template/footer timestamps, but those do not establish when each claim was checked. Parent review retained `sourceDate: null` for those entries; `checkedAt` separately records this research date. Dates mentioned in the notes below are page metadata, not current-condition evidence.

## Hotels

| Catalogue entry | Official source | Supported by the source | Still unknown |
| --- | --- | --- | --- |
| The Legacy – Luxury by Bridge View | [legacyshimla.com](https://legacyshimla.com/) | Hotel name, Mall Road location, and hotel website wording that access is via a private lift or a short walk. | Website does not clarify whether that lift serves all guest rooms or whether it is currently operating. Step-free arrival-to-room access, bathroom cleanliness/suitability, guest reports, and family-specific facilities were not verified. |
| The Oberoi Cecil | [Oberoi Hotels](https://www.oberoihotels.com/sitecore/content/OberoiHotels/Home/hotels-in-shimla-cecil/overview) | Hotel name and Chaura Maidan, Shimla location; hotel page describes the property and nearby landmarks. | Lift, step-free arrival-to-room access, bathroom condition/suitability, guest reports, and family-specific facilities were not verified. |
| Hotel Marina | [Hotel Marina](https://www.marinashimla.com/) | Hotel name and Mall Road, Shimla location, as stated on the hotel's own page. | Lift, step-free arrival-to-room access, bathroom condition/suitability, guest reports, and family-specific facilities were not verified. |
| The Holiday Home | [HPTDC Shimla package page](https://hptdc.in/index.php/shimla-honeymoon-package/) | HPTDC itinerary names Hotel Holiday Home, Shimla, as its accommodation. The HPTDC page is not a room inventory or current rate source. | Lift, step-free arrival-to-room access, bathroom condition/suitability, guest reports, and family-specific facilities were not verified. No price was carried into the seed. |

No guest reviews were used. The sample includes three privately operated hotels and one state tourism corporation property, but remains limited and is not a price-tier-balanced survey. The hotel entries do not establish that a property is suitable for any particular family's mobility, hygiene, or supervision needs.

## Places and activities

| Catalogue entry | Official source | Source-supported facts | Limitations retained in the seed |
| --- | --- | --- | --- |
| The Ridge | [Himachal Tourism: Shimla](https://himachaltourism.gov.in/destination/shimla/) (footer date: 2019-05-28) | Described as an open space beside Mall Road and a cultural hub, with heritage landmarks and mountain views. | No verified route gradients, step-free access, seating, toilets, current crowd or weather conditions. |
| Army Heritage Museum, Annandale | [Himachal Tourism: Museum](https://himachaltourism.gov.in/heritage-tourism-attractions-in-shimla-solan/museum/) (footer date: 2025-09-30) | Museum at Annandale, about 5 km from Old Bus Stand; official page mentions local buses/taxis and a virtual-reality experience centre. | Current hours, admission, transport, experience-centre availability, age guidance, and accessible routes/toilets not verified. Classified as an excursion. |
| Gaiety Theatre | [Himachal Tourism: Shimla](https://himachaltourism.gov.in/destination/shimla/) (footer date: 2019-05-28) | Named as a landmark on The Ridge; the page describes its slate roofline. | This supports viewing it as a landmark only. Current interior access, performances, hours, admission, and accessibility were not verified. |
| Craignano Nature Park | [Himachal Tourism: Shimla](https://himachaltourism.gov.in/destination/shimla/) (footer date: 2019-05-28) | Nature park outside Shimla; tulip garden is described as blooming around March–April; page lists it 16 km from the city. | Current opening and bloom status, transport, routes, toilets, and food not verified. Classified as an excursion. |
| Naldehra | [Himachal Tourism: Shimla](https://himachaltourism.gov.in/destination/shimla/) (footer date: 2019-05-28) | Meadow with deodar forest, 18-hole golf course, and a nature walk described as traversing uphill; page lists it 23 km from the city. | The route is flagged as uphill; the source does not establish that this specific walk is strenuous. Source does not give gradient, surface, trail state, transport, opening status, toilets, or food. Classified as an excursion. |
| Shali Tibba Temple | [Himachal Tourism: Shimla](https://himachaltourism.gov.in/destination/shimla/) (footer date: 2019-05-28) | Hilltop temple dedicated to Bhima Kali; page says it is reached by a gruelling uphill trek from Khatnol and lists Khatnol 45 km by road from Shimla. | The trek is explicitly flagged as strenuous. The page does not say there are stairs, nor establish an alternate step-free route, trail condition, current temple operation, toilets, or food. Classified as an excursion. |

## Search and handling notes

- Searched official Himachal Tourism pages for Shimla attractions, temples, museums, and hotel options; searched individual hotel official sites for the three private properties; searched HPTDC's official site for a state-operated Shimla property.
- Opened the official Himachal Tourism Shimla destination page and museum page, official hotel pages, and the HPTDC itinerary page. The activity descriptions are short paraphrases of those sources.
- A source naming a site does not verify that it is open, safe, step-free, operating, or appropriate for a specific child or mobility need. Those details remain unknown unless the official page directly supported a narrower statement.
- Prices are empty/null throughout. No live rates, dated unit-specific tariffs, travel-time estimates, medical services, bathrooms, food service at activities, current ropeway/lift operation, accessibility, or guest hygiene assessments were inferred.
- `setting: "excursion"` marks places outside central Shimla that require a separate visit. The application should obtain traveller consent before adding such a place to an itinerary.

Parent review: Naldehra uses uphill-walk, not strenuous-walk. Removed the golf-course hole count because official sources disagree and it is irrelevant to family fit. Interest tags are editorial retrieval categories, not evidence of age suitability. Excursion locations have no verified travel time or confirmed accessible route.
