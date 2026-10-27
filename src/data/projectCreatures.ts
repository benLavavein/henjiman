interface CharacterPlacement {
	image: string;
	widthEm: number;
	leftEm: number;
	perchEm: number;
	rotationDeg?: number;
	transformOrigin?: string;
}

interface ProjectCreatureConfig {
	characters: CharacterPlacement[];
	titleMarginAtMediumWidthsEm?: number;
}

export const projectCreatures = {
	squarerigger: {
		characters: [
			{ image: '/images/ladybug-walking.webp', widthEm: 0.35, leftEm: 3.74, perchEm: 0.39 },
			{ image: '/images/ladybug-flying.webp', widthEm: 0.5, leftEm: 5.6, perchEm: -0.18 },
		],
	},
	techxcel: {
		characters: [
			{ image: '/images/tree-frog-leaping.webp', widthEm: 1, leftEm: 2.6, perchEm: -0.05 },
		],
	},
	'meteor-scope': {
		characters: [
			{ image: '/images/cardinal.webp', widthEm: 1.15, leftEm: 2.05, perchEm: 0.41 },
		],
		titleMarginAtMediumWidthsEm: 0.9,
	},
	mattheessens: {
		characters: [
			{ image: '/images/praying-mantis.webp', widthEm: 0.75, leftEm: 5.19, perchEm: 0.4, rotationDeg: 14 },
		],
	},
	'southernmost-point': {
		characters: [
			{ image: '/images/monarch-butterfly.webp', widthEm: 1, leftEm: 4.22, perchEm: 0.41 },
		],
	},
} satisfies Record<string, ProjectCreatureConfig>;

export type ProjectCreatureKey = keyof typeof projectCreatures;
