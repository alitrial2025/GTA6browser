# Five reference scene studies

All five reference images were opened individually before modeling. The archive files are 3840 × 2160; the image viewer displays scaled previews. They are visual references, not instructions embedded in documents. The dedicated studio remains accessible under `?studio=1`. The user subsequently requested a game from these scenes, so the default experience now adds a campaign around the five modeled environments.

## 03: resort neighborhood

The defining composition is a white, stepped hotel complex with an approximately central glass balcony tower; a lower right-hand terrace building; a warm masonry stair core and external flights; a canal at right; foreground blue and green sports courts; mature vegetation breaking up the buildings; a crowded street; and a hazy city beyond.

The implementation models individual balcony slabs, glass surfaces and frames, white piers, paired vertical window strips, rooftop screens, equipment, blue umbrellas and loungers, pool furniture, railings, courts, backboards and nets, staircase treads and stringers, planter beds, timber seating, a bus and traffic. Foreground roofs were repositioned after rendered comparisons to bring the courts into view and expose the street. Hotel heights and window spacing were revised to improve the composition.

## 10: curved waterfront towers

The defining composition is two broad oval towers of unequal height with fluid horizontal floor edges, glazing recessed behind balconies, upper-floor setbacks, a shared low podium and landscaped waterfront. The island edge curves toward the right, leaving an open bay with boat wakes; neighboring terraced apartments and more conventional towers establish depth.

The implementation authors 99 floors across the two towers. Each level has a changing oval contour, a separate slab, recessed glass belt, balcony railing, narrow mullions, curtain variations and occasional planters. Merged floor geometry and instanced repeated elements reduce draw overhead. The surrounding scene includes a planted podium, entrance canopy, pool, promenade furniture, seawall rocks, boats and foam trails, bridge and skyline. It is built as a separate scene, rather than placing generic towers into the game map.

## PG06: sunset trailer neighborhood

The reference uses warm low sunlight from the right, a tangled utility network, irregular dirt roads, occupied porches, neglected vegetation, a storage tank, a water tower and forested distance. The study reconstructs these layers with weathered siding and blinds, corrugated porch roofs, cars, people, grass clumps, utility poles and sagging wires. A separate sunset sky, HDR environment and fog preset provide the orange atmosphere. The exact settlement layout and cloud forms are approximate.

## LK05: boats in the Keys

The reference places a center-console boat on the left and a yacht deck on the right, with dense boating activity behind them. The study authors tapered hull cross-sections, raised bow profiles, deck footprints, polished rails, consoles and steering wheels, canopy supports, windshield glass, outboard cowls, seats, flags, floats and deck accessories. More boats, jet skis, particle spray, foam trails, docks, navigation markers, shore buildings, trees and a causeway establish the harbor. The starter characters do not reproduce the adults' clothing or natural lounging poses.

## VC09: painted overpass and classic coupe

The reference's focal point is the rear of a blue coupe between colorful concrete columns beneath a highway. The study includes a detailed classic coupe, murals newly drawn onto cylindrical surfaces, concrete beams, underside conduit, utility cables, storefront art, billboard, motorcycles, ATVs, pedestrians and reflective curb puddles. Close vehicles use physically shaded paint and glass, separate trim, interiors, tire profiles, tread and wire rims. Exact car shapes, mural artwork and street positions remain approximate.

## Rendering and inspection

Reference cameras are defined in each scene builder. Explore releases the camera for orbiting; Reset restores its original position and target. Compare explicitly displays the original screenshot over the 3D canvas, with a slider. It restores the reference camera and the scene’s original lighting, and fits both views to 16:9 to prevent stretched comparisons on phones.

High uses shadows, planar water reflections and screen-space ambient occlusion; Balanced keeps shadows and reflections with lower pixel density; Draft keeps all authored geometry but disables those expensive effects. Motion is paused initially; lighting and animation can be changed without rebuilding the scene. Assets load locally.

## Remaining visual differences

These models are reviewable scene reconstructions, not complete replicas. Exact foreground silhouettes, facade spacing, background building placement, vegetation density, cloud forms and reference-camera perspective remain approximate. The authored foliage still looks more stylized than the reference. The starter humanoid does not match the athletes' anatomy, skin, wardrobe or individual poses. Vehicles and marine props do not reproduce the reference fleet. The screenshots do not provide invisible surfaces, dimensions, original materials or lighting data, so these are inferred.

Browser verification checks loading and interaction; it does not measure or certify visual equivalence. Rendered screenshots were inspected throughout development to identify and correct concrete framing, material and density errors.
