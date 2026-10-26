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
			{ image: '/images/ladybug-walking.png', widthEm: 0.35, leftEm: 3.74, perchEm: 0.39 },
			{ image: '/images/ladybug-flying.png', widthEm: 0.5, leftEm: 5.6, perchEm: -0.18 },
		],
	},
	techxcel: {
		characters: [
			{ image: '/images/tree-frog-climbing.png', widthEm: 0.48, leftEm: 3.5, perchEm: 0.81, rotationDeg: 14 },
		],
	},
	'meteor-scope': {
		characters: [
			{ image: '/images/cardinal.png', widthEm: 1.3, leftEm: 2, perchEm: 0.44 },
		],
		titleMarginAtMediumWidthsEm: 0.9,
	},
	mattheessens: {
		characters: [
			{ image: '/images/stick-bug.png', widthEm: 1.4, leftEm: 3.578, perchEm: 0.395 },
		],
	},
	'southernmost-point': {
		characters: [
			{ image: '/images/monarch-butterfly.png', widthEm: 1, leftEm: 4.22, perchEm: 0.41 },
		],
	},
} satisfies Record<string, ProjectCreatureConfig>;

export type ProjectCreatureKey = keyof typeof projectCreatures;
