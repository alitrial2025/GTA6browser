# Earlier game prototype reference study

This document records the earlier game phase. The active five-scene studio is documented in [SCENE_STUDIES.md](SCENE_STUDIES.md).

The first five images in both uploaded archives were opened individually using the image viewer; archive originals are 3840 × 2160. The initial procedural street scene was too simplified relative to them; the art pass below addresses observable differences rather than treating a contact sheet as sufficient evidence.

## Places.zip: first five

1. **Leonida Keys 01**: raised two-way causeway and regularly spaced piers; dense, irregular island vegetation; pale sand margins; turquoise shallows; visible wave detail; hazy distant skyline; foreground seaplane. Implemented sloped bridge collision segments, piers, irregular vertex-colored shores, leafy mangrove canopies, reflective water, and a scenic floatplane.
2. **Leonida Keys 02**: weathered street surfaces; utility poles and sagging overhead wires; low roadside businesses; varied adult people and vehicles; dense tropical background. Implemented utility poles/wires, roadside village, local ground textures, textured skeletal people, and a near/far vehicle model transition. Specific human faces, mobility scooter, bus, and iguana are not recreated.
3. **Leonida Keys 03**: timber venue with painted green beams, sloping metal roof, porch and railing; a wide aged sign; striped picnic tables; small props; palms close to the camera. Implemented a modeled waterfront venue with photographed wood textures, porch details, sign, stairs, picnic tables, bottles, planters, and nearby palms.
4. **Leonida Keys 04**: underwater blue-green attenuation; sun shafts; rocky reef; branching colorful corals; fish and sea turtles; diver. Implemented underwater fog, light shaft, rocky seafloor, branching coral, animated fish and patterned turtle models, and swimming/diving access. Human scuba gear and reference-level biological detail are not recreated.
5. **Leonida Keys 05**: boats of several sizes; hulls, rails, cabins, outboard motors, wood decks; reflective water and wakes; people on deck. Implemented modeled yachts and speedboats with rails, cabins, decks and motors, deck occupants, bobbing motion, and reflective water. Boats are scenic; dense wake spray and boat controls are not implemented.

## Vice City.zip: first five

1. **Vice City 01**: large weathered city sign, sunset backlight, palm silhouettes, aircraft. Existing sign work, HDR sunset, palm geometry and aircraft provide the general elements; the complete composition and sign are not recreated.
2. **Vice City 02**: balcony above a dense palm-filled beachfront resort; layered pools, stairs, cabanas, lounge chairs; low warm sun. Implemented a pool courtyard, palms, terrace, loungers, umbrellas, pergola, balconies, stairs and HDR environment lighting. The two foreground people are not replicated.
3. **Vice City 03**: white hotel blocks with real glass strips, numerous separate balconies, staggered massing, rooftop structures, sports courts, mature palms and streets below. Generic starting blocks were replaced by modeled hotel wings, glass fenestration, balcony slabs and rails, penthouses, external stairs, and two painted basketball courts.
4. **Vice City 04**: close-up human skin, hair, eyes, cloth, tattoos, accessories, and reflected lighting. A low-poly procedural person does not meet this bar. Replaced primitives with a textured skeletal starter model; high-fidelity character assets and individual clothing/skin authoring remain required for reference fidelity.
5. **Vice City 05**: timber lifeguard tower with porch and stairs; weathered bright paint; a populated beach; umbrellas and distant architecture. Implemented a detailed yellow timber tower with veranda, handrails, glass opening, roof and stairs, plus denser beachfront vegetation and props. Reference characters and exact wardrobe remain unmatched.

## Validation standard

All six selectable views must load as genuine 3D scenes, without failed local assets or shader errors. Driving, collision, suspension, walking, missions, map, garage, settings, photo export, and mobile controls must continue to work after the art changes. Screenshot comparison is qualitative: no claim of a 100% image match is made.
