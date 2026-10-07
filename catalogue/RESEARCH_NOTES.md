# Catalogue research notes (Shimla seed + multi-destination expansion)

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

---

# Multi-destination expansion — checked 2026-10-08

Catalogue version `multi-destination-2026-10-08`. Every source below was downloaded and its text read during this pass; search-result snippets were not used as evidence. `sourceDate` is `null` throughout because none of these pages shows a reliable publication or update date for the specific claim, except the K's House news item (2026-07-16). `checkedAt` is the research date. No guest reviews were used, so no entry is labelled Guest-verified. Prices remain `[]`/`null`.

## Counts by destination

| Destination | Hotels | Places | Target (3 hotels / 5 places) |
| --- | ---: | ---: | --- |
| Shimla | 4 | 6 | Met |
| Goa | 1 | 6 | **Hotel shortfall (1 of 3)** |
| Udaipur | 2 | 8 | **Hotel shortfall (2 of 3)** |
| Kochi | 3 | 6 | Met |
| Tokyo | 3 | 6 | Met |
| Singapore | 2 | 6 | **Hotel shortfall (2 of 3)** |
| Kathmandu | 3 | 5 | Met |
| **Total** | **18** | **43** | |

## Corrections and additions to existing Shimla entries

- `shimla_legacy_bridge_view`: added a **Hotel-claimed** lift item. The hotel's own site hosts an undated testimonial saying lift access helped with elderly parents. It is hotel-selected, so it is not Guest-verified, and it does not prove the lift works today or reaches every room. The site also says the hotel is near the public "Tourism Lift"; that is a public facility, not hotel evidence, and is not stored.
- `shimla_oberoi_cecil`: added a **Hotel-claimed, adverse** item under topic `other`. The official page says the spa is reached by wooden stairs. It is stored as `other`, not `step-free-access`, because it covers the spa only. Using `step-free-access` would make the app exclude the whole hotel for limited-mobility travellers on evidence that does not concern guest rooms.
- Hotel Marina and HPTDC Holiday Home are unchanged. A recheck of the Marina homepage found no lift or access wording.
- Existing Shimla places and their `checkedAt` dates were preserved.

## Hotels

| ID | Source | What the source establishes | Unknown |
| --- | --- | --- | --- |
| goa_la_maison_fontainhas | https://www.lamaisongoa.com/ | Name; 8 heritage rooms in the narrow by-lanes of Panaji's Latin quarter (Fontainhas). | Lift, step-free route, bathrooms. Vehicle access down narrow lanes is unknown. |
| udaipur_udai_kothi | https://www.udaikothi.com/ | Name; boutique hotel described as "high above the Lake Pichola", a short stroll from the old city. | Lift, step-free route, bathrooms. "High above the lake" may imply steps, but this is not stated. |
| udaipur_trident | https://www.tridenthotels.com/hotels-in-udaipur | Facility list includes "Rest Rooms for Guests with Special Needs" and "Wheelchairs" (Hotel-claimed, `other`). | Route, lift and room layout. The same page carries an expired 2023–2024 tariff table, so it may be stale. |
| kochi_brunton_boatyard | https://www.cghearth.com/brunton-boatyard | Name; CGH Earth heritage hotel in Fort Kochi. | Lift, access, bathrooms. A CGH Earth group FAQ mentions differently-abled rooms but does not clearly tie each answer to Brunton Boatyard, so it was **not** used. |
| kochi_forte_kochi | https://www.fortekochi.in/ | Name; heritage boutique hotel in Fort Kochi. | Lift, access, bathrooms. |
| kochi_bolgatty_palace | https://www.ktdc.com/bolgatty-palace | KTDC (state) property on Bolgatty island off Marine Drive; palace built by Dutch traders in 1744; main, mansion and marina blocks plus six lake-view cottages. | Lift, access, bathrooms; route to Fort Kochi places. |
| tokyo_keio_plaza | https://www.keioplaza.co.jp/en/ and https://www.keioplaza.co.jp/en/guide/universal/ | Universal Service page (Japanese text) states 13 universal rooms (Hotel-claimed, `other`). | What a "universal room" includes; lift routing; bathroom layout. |
| tokyo_hotel_gracery_shinjuku | https://gracery.com/shinjuku/ (Japanese facilities and FAQ pages) | Every room has a toilet and separate bath, except universal twin rooms with a unit bath (Hotel-claimed, `bathroom`, layout only). FAQ lists a wheelchair among free loan items (Hotel-claimed, `other`). | Cleanliness, step-free route, lift. |
| tokyo_ks_house_tokyo_oasis | https://kshouse.jp/tokyo-oasis-e/index.html | Facility list includes an elevator (Hotel-claimed, lift, supportive). Common lounge and Japanese-style common area; news item dated 2026-07-16 about a calligraphy event (Hotel-claimed, social). | Floors served by the elevator; current event schedule; staff responsiveness. |
| singapore_parkroyal_collection_pickering | https://www.panpacific.com/en/hotels-and-resorts/pr-collection-pickering.html | Name; Chinatown location. | Lift, access, bathrooms. |
| singapore_goodwood_park_hotel | https://www.goodwoodparkhotel.com/ | Name; heritage hotel; page says 233 rooms and suites. | Lift, access, bathrooms. |
| kathmandu_dwarikas | https://www.dwarikas.com/ | Name "The Dwarika's"; address Battisputali, Kathmandu. | Lift, access, bathrooms. |
| kathmandu_yak_and_yeti | https://www.yakandyeti.com/ | Name; Durbar Marg, minutes' walk from the former Royal Palace (hotel's own description). | Lift, access, bathrooms. |
| kathmandu_kgh_thamel | https://www.ktmgh.com/ | Name; heritage hotel in Thamel, operating since 1968 per its site. | Lift, access, bathrooms, social activity. |

Every hotel keeps the three baseline **Unverified** items (lift, step-free route, bathroom). A Hotel-claimed item never replaces them.

## Places and activities

Source pages (all opened 2026-10-08):

- **Goa:** Incredible India (Ministry of Tourism), https://www.incredibleindia.gov.in/en/goa: Bom Jesus, Fontainhas and São Tomé, Fort Aguada, Chapora Fort, Mapusa Friday market, Patnem Beach. All six are `excursion` because Goa is a state, not one town, and no hotel-to-place route is known.
- **Udaipur:** Rajasthan Tourism, https://www.tourism.rajasthan.gov.in/udaipur.html plus the Lake Pichola and Fateh Sagar Lake pages.
  - `central`: City Palace, Bagore-ki-Haveli, Lake Pichola and Fateh Sagar, because the source places them on or beside the city lakes.
  - `excursion`: Saheliyon-ki-Bari and Ahar Museum, because the source gives no distance from the old city; Shilpgram (7 km west) and Udai Sagar (13 km east), which are outlying.
- **Kochi:** Kerala Tourism, https://www.keralatourism.org/destination/fort-kochi/422/ and https://www.keralatourism.org/kochi/backwaters-kochi.php.
  - Fort Kochi and Mattancherry places are `central` because two of the three catalogued hotels are in Fort Kochi. Bolgatty guests would need a route check.
  - The KTDC canal tour starts at Sea Lord Jetty on Marine Drive and is `excursion`.
- **Tokyo:** GO TOKYO (Tokyo Convention & Visitors Bureau), spot pages 65, 20, 76, 170, 552 and 255 under https://www.gotokyo.org/en/spot/.
- **Singapore:** Visit Singapore (Gardens by the Bay, Chinatown and green-spaces pages) and NParks (Sungei Buloh page).
- **Kathmandu:** Nepal Tourism Board pages for Kathmandu Durbar Square, Garden of Dreams, Swayambhunath, Pashupatinath and Kirtipur under https://ntb.gov.np/.

**Lesser-known or less central options.** Each is supported by the source's own wording, not by popularity data:
- Patnem Beach: Incredible India calls it "infinitely quieter" than Palolem.
- Ahar Museum and Udai Sagar Lake (Udaipur).
- KTDC village canal tour (Kochi).
- Yanaka Ginza and Sunamachi Ginza shopping streets (Tokyo).
- Sungei Buloh and Pulau Ubin: Visit Singapore names them among "lesser-known green spaces".
- Kirtipur (Kathmandu).

**Access.** Every new place keeps `access.status: "unknown"`. Swayambhunath's main approach is "exceedingly steep stone steps", but NTB also describes a motor road almost to the top followed by a short walk. Because a non-stair route exists, it is not marked `stairs-required`, and no `restrictions` value describes steps. The details text tells travellers to avoid the steps. No new place uses `restrictions`, because none of the sources describes an uphill or strenuous walk in those terms.

**Interest tags are editorial.** `nature`, `culture`, `children`, `food`, `scenic` and `rest` are retrieval categories chosen during research. They are not public facts and not proof of age suitability. Only Showa Kinen Park carries `children`, because GO TOKYO explicitly describes children's play areas there.

## Evidence requiring a future schema extension

The activity schema only allows `bathrooms` and `food` to be the literal `"Unverified"` and keeps `priceINR` null, so these sourced facts are recorded here only:

- **Toilets and accessibility icons (GO TOKYO):** the Tsukiji Outer Market, Hama-rikyu Gardens, Meiji Jingu and Showa Kinen Park pages list facility icons such as wheelchair ramp, elevator, multi-purpose toilet, toilet with handrails and diaper-changing facilities. These are site-level listings, not route-level verification.
- **Food at places:** Garden of Dreams (NTB: restaurant and bar), Chinatown Complex Food Centre (halal-options icon), Tsukiji Outer Market (cash-only stalls).
- **Fees (not converted to INR):** NTB's heritage-site fee page (https://ntb.gov.np/plan-your-trip/before-you-come/heritage-site-entry-fees) lists Pashupatinath at NPR 1,000 per day per entry for foreign nationals and free for Indian nationals, and Boudha Stupa at NPR 400 for foreign nationals with under-10s free. NTB notes that the figures come from the departments concerned and may change. The fee depends on the visitor category (Indian, SAARC or other), so no single INR value can be stored.
- **Closures:** NParks says Sungei Buloh Platform 1 is closed 6 June – 23 October 2026 and that flood-prone areas may close. Gardens by the Bay posted a one-hour Flower Field closure on 8 October 2026.

## Unavailable, blocked or rejected sources

- **Blocked (HTTP 403 or timeout from the research environment):** Taj Hotels (Taj Fort Aguada, Taj Lake Palace), Panjim Inn, Goa Tourism (goa-tourism.com, goatourism.gov.in), the UNESCO World Heritage page for Kathmandu Valley, Marina Bay Sands, Raffles Singapore, Jagat Niwas Palace. These hotels were **not** added because no opened page confirmed their identity.
- **Zostel** destination pages returned HTTP 405, so no Zostel hostels were added, even though they would have helped the solo persona.
- **Rejected:** `hotelfidalgo-goa.com` now serves unrelated betting content. The domain appears to have lapsed, so it was not used.
- **Moved:** the NParks Singapore Botanic Gardens and Pulau Ubin pages redirect to a "page relocated" notice, so Pulau Ubin is sourced from Visit Singapore instead.
- **Closed:** the original K's House **Tokyo** branch shows a farewell notice. The catalogued property is the still-open **K's House Tokyo Oasis** branch.

## Coverage and selection bias

- **The hotel sample is luxury-heavy.**
  - Most of the 14 new hotels are luxury or heritage properties: Brunton Boatyard, The Dwarika's, Hotel Yak & Yeti, Keio Plaza, Goodwood Park, PARKROYAL COLLECTION Pickering and Trident.
  - Only K's House Tokyo Oasis, Kathmandu Guest House and the KTDC property are close to budget or mid-range.
  - The cause: large hotel groups run websites that can be fetched, while budget operators often sell only through booking platforms or blocked sites.
  - **Do not present this sample as price-balanced.** Until budget properties are added, it works against the price-bias mitigation.
- **Sources lean towards official tourism boards.** Boards promote well-known attractions, and lesser-known options were included only where the board itself described them. Geographical diversity is limited by what the boards chose to publish.
- **There is no guest evidence.** Without dated, independent guest reviews, nothing is Guest-verified. Meena will see "Unverified" on almost every lift and bathroom label. That is honest, but it limits how useful the app is until guest evidence is researched.
- **The solo persona is barely covered.** Only K's House Tokyo Oasis has any `social` evidence. Arjun's needs (real social events, staff responsiveness, policies for problems between guests) are largely unresearched.
