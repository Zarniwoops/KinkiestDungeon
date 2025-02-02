"use strict";

/**
 * Determines if the enemy (which can be hostile) is aggressive, i.e. will pursue the player or ignore
 * @param {entity} [enemy]
 * @param {entity} [player]
 * @returns {boolean}
 */
function KinkyDungeonAggressive(enemy, player) {
	if (!player || player.player) {
		// Player mode
		if (enemy && enemy.hostile > 0) return true;
		if (!KDGameData.PrisonerState || KDGameData.PrisonerState == "chase") return KDHostile(enemy);
		if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.4) return KDHostile(enemy);
		if (enemy && KDFactionRelation(KDGetFaction(enemy), "Jail") < -0.1
			&& KDGameData.PrisonerState != 'jail'
			&& (KDGameData.PrisonerState != 'parole' || !KinkyDungeonPlayerInCell(true, true)))
			return KDHostile(enemy);
		return false;
	}
	// Non player mode
	return KDHostile(enemy, player);
}

/**
 * Returns whether or not the enemy is ALLIED, i.e it will follow the player
 * @param {entity} enemy
 * @returns {boolean}
 */
function KDAllied(enemy) {
	return !(enemy.rage > 0) && !(enemy.hostile > 0) && KDFactionAllied("Player", enemy, undefined,
		KDOpinionRepMod(enemy, KDPlayer()));
}

/**
 * Returns whether the enemy is HOSTILE to the player (if no optional argument) or the optional enemy
 * @param {entity} enemy
 * @param {entity} [enemy2]
 * @returns {boolean}
 */
function KDHostile(enemy, enemy2) {
	if (enemy == enemy2) return false;
	return (enemy.rage > 0) ||
		(
			!(!enemy2 && enemy.ceasefire > 0)
			&& !(enemy2 && enemy2.ceasefire > 0)
			&& (
				(!enemy2
					&& (KDFactionHostile("Player", enemy, KDOpinionRepMod(enemy, enemy2 || KDPlayer()))
					|| enemy.hostile > 0)
					|| (enemy2 && ((KDGetFaction(enemy2) == "Player" && enemy.hostile > 0)
					|| KDFactionHostile(KDGetFaction(enemy), enemy2, KDOpinionRepMod(enemy, enemy2 || KDPlayer())))))));
}

/**
 *
 * @param {entity} enemy
 * @param {player} enemy
 * @returns {number} The modifier to reputation based on the NPC's opinion
 */
function KDOpinionRepMod(enemy, player) {
	if (!player?.player) return 0;
	let op = KDGetModifiedOpinionID(enemy.id, true, true, true, 0);
	if (op) {
		return 0.1 * Math.max(-3, Math.min(20, op/KDOpinionThreshold));
	}
	return 0;
}

/**
 *
 * @param {KDCollectionEntry} value
 * @returns {boolean}
 */
function KDIsServant(value) {
	return value && value.status == "Servant";
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetFaction(enemy) {
	if (!enemy) return undefined;
	if (enemy.player) return "Player";
	if (enemy.rage > 0) return "Rage";
	if (enemy.faction) return enemy.faction;
	if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""])) return "Player";
	let E = enemy.Enemy;
	if ((E && E.allied) || ((enemy.allied || (E && E.faction && KDFactionAllied("Player", E.faction) && !KDEnemyHasFlag(enemy, "NoFollow"))) && !enemy.faction && !KDEnemyHasFlag(enemy, "Shop"))) return "Player";
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Gets the faction of the enemy, returning "Player" if its an ally, or "Enemy" if no faction
 * @param {entity} enemy
 * @returns {string}
 */
function KDGetFactionOriginal(enemy) {
	if (enemy.player) return "Player";
	if (enemy.faction) return enemy.faction;
	if (KDGameData.Collection && KDIsServant(KDGameData.Collection[enemy.id + ""])) return "Player";
	let E = enemy.Enemy;
	if (E && E.faction) return E.faction;
	return "Enemy";
}

/**
 * Consults the faction table and decides if the two mentioned factions are hostile
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @param {number} mod - modifier to faction rep - constrained to positive
 * @param {number} modfree - modifier to faction rep - free
 * @returns {boolean}
 */
function KDFactionHostile(a, b, mod = 0, modfree = 0) {
	if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0) return true;
	if (!(typeof b === "string") && b.rage > 0) return true;
	if (a == "Player" && !(typeof b === "string") && b.allied > 0) return false;
	if (!(typeof b === "string")) b = KDGetFaction(b);
	if (a == "Rage" || b == "Rage") return true;
	if (a == "Player" && b == "Enemy") return true;
	if (b == "Player" && a == "Enemy") return true;
	if (KDFactionRelation(a, b) + Math.max(0, mod) + modfree <= -0.5) return true;
	if (a == b) return false;
	return false;
}

/**
 * Consults the faction table and decides if the two mentioned factions are allied
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @param {number} [threshold] - Faction 2
 * @param {number} mod
 * @returns {boolean}
 */
function KDFactionAllied(a, b, threshold = 0.7, mod = 0) {
	if (a == "Player" && b && !(typeof b === "string") && b.hostile > 0) return false;
	if (!(typeof b === "string") && b.rage > 0) return false;
	if (a == "Player" && !(typeof b === "string") && b.allied > 0) return true;
	if (!(typeof b === "string")) b = KDGetFaction(b);
	if (a == "Rage" || b == "Rage") return false;
	if (a == "Player" && b == "Player") return true;
	if (b == "Enemy" && a == "Enemy") return true;
	if (KDFactionRelation(a, !(typeof b === "string") ? KDGetFaction(b) : b) >= threshold) return true;
	if (a == b) return true;
	return false;
}

/**
 * Consults the faction table and decides if the two mentioned factions are favorable (i.e no friendly fire)
 * @param {string} a - Faction 1
 * @param {string | entity} b - Faction 2
 * @returns {boolean}
 */
function KDFactionFavorable(a, b) {
	return KDFactionAllied(a, b, 0.099);
}


/**
 *
 * @param {string[]} list
 * @param {number} Floor
 * @param {string} Checkpoint
 * @param {string[]} tags
 * @param {any} bonustags
 * @param {number} [X]
 * @param {number} [Y]
 * @returns {Record<string, number>}
 */
function KDGetFactionProps(list, Floor, Checkpoint, tags, bonustags, X = 0, Y = 0) {
	/** @type {Record<string, number>} */
	let mp = {};
	for (let faction of list) {
		if (KDFactionProperties[faction]) {
			mp[faction] = KDFactionProperties[faction].weight(Floor, Checkpoint, tags, X, Y);
		}
	}
	return mp;
}

/**
 * Gets the honor from faction a toward faction b
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function KDGetHonor(a, b) {
	if (KDFactionProperties[a]) {
		if (KDFactionProperties[a].honor_specific[b]) {
			return KDFactionProperties[a].honor_specific[b];
		}
		return KDFactionProperties[a].honor;
	}
	return -1;
}