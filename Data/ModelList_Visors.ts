/**
 * TIPS AND TRICKS FOR CONTRIBUTORS
 * 1) Memorize the layering of body parts. Hands are higher than arms, feet higher than legs
 * 2) Generally you will want to avoid lower pri items on the same layer sticking out on seams if your object is skintight.
 * In general, this is accomplished by having higher priority items cover more of the original
 */





AddModel({
	Name: "Goggles",
	Folder: "Visors",
	Parent: "Goggles",
	TopLevel: true,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "Dollmaker", Layer: "Goggles", Pri: 14,
			InheritColor: "Goggles",
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel(GetModelRestraintVersion("Goggles", true));

AddModel({
	Name: "FullVisor",
	Folder: "Visors",
	Parent: "Goggles",
	TopLevel: false,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "DollmakerFull", Layer: "MaskOver", Pri: 50,
			InheritColor: "FullVisor",
			Invariant: true,
			HideWhenOverridden: true,
		},
	])
});
AddModel({
	Name: "FullVisorRim",
	Folder: "Visors",
	Parent: "Goggles",
	TopLevel: false,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "DollmakerFull", Layer: "MaskOver", Pri: 50,
			InheritColor: "FullVisor",
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "DollmakerFullRim", Layer: "MaskOver", Pri: 50.1,
			InheritColor: "Rim",
			Invariant: true,
			NoOverride: true, TieToLayer: "DollmakerFull",
		},
	])
});
AddModel(GetModelRestraintVersion("FullVisor", true));
AddModel(GetModelRestraintVersion("FullVisorRim", true));


AddModel({
	Name: "GasMask",
	Folder: "Gasmask",
	Parent: "GasMask",
	TopLevel: true,
	Categories: ["Accessories", "Face"],
	Layers: ToLayerMap([
		{ Name: "Mask", Layer: "GagMuzzle", Pri: 10,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			HideWhenOverridden: true,
		},
		{ Name: "Valves", Layer: "GagMuzzle", Pri: 20,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true, TieToLayer: "Mask",
		},
		{ Name: "Center", Layer: "GagMuzzle", Pri: 10.1,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true, TieToLayer: "Mask",
		},
		{ Name: "Nose", Layer: "GagMuzzle", Pri: 10.2,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true, TieToLayer: "Mask",
		},
		{ Name: "Plugs", Layer: "GagMuzzle", Pri: 20.2,
			OffsetX: 942,
			OffsetY: 200,
			Invariant: true,
			NoOverride: true, TieToLayer: "Valves",
		},
	])
});
AddModel(GetModelRestraintVersion("GasMask", true));