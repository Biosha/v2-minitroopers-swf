import { PrismaClient } from "@minitroopers/prisma";
import { getAddCost, getUpgradeCost, TrooperSkill } from "@minitroopers/shared";
import { Request, Response } from "express";
import { sendError } from "../utils/httpErrors.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
import { auth, IncludeAllUserData } from "../utils/UserHelper.js";

const Troopers = {
  updateConfig:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        if (
          !req.body.trooperId ||
          typeof req.body.trooperId != "string" ||
          !req.body.config
        ) {
          return sendError(res, 400, "Invalid request");
        }
        if (
          req.body.config.targetSystem == null ||
          typeof req.body.config.targetSystem != "number" ||
          req.body.config.targetSystem < 0 ||
          req.body.config.targetSystem > 3
        ) {
          return sendError(res, 400, "Invalid target system");
        }
        if (
          req.body.config.moveSystem == null ||
          typeof req.body.config.moveSystem != "number" ||
          req.body.config.moveSystem < 0 ||
          req.body.config.moveSystem > 2
        ) {
          return sendError(res, 400, "Invalid move system");
        }
        if (
          req.body.config.CBody != null &&
          (typeof req.body.config.CBody != "number" ||
            req.body.config.CBody < 0 ||
            req.body.config.CBody > 7)
        ) {
          return sendError(res, 400, "Invalid body slot");
        }

        if (
          req.body.config.selectedItems != null &&
          (typeof req.body.config.selectedItems != "object" ||
            req.body.config.selectedItems.length > 3)
        ) {
          return sendError(res, 400, "Invalid selected items");
        }

        const user = await auth(prisma, req);
        const trooper = user.troopers.find((x) => x.id === req.body.trooperId);
        if (!trooper) {
          return sendError(res, 404, "Trooper not found");
        }

        const trooperSkill = new TrooperSkill(trooper.seed, trooper.choices);

        if (req.body.config.CWeapon != null) {
          if (
            typeof req.body.config.CWeapon != "number" ||
            req.body.config.CWeapon < 0 ||
            req.body.config.CWeapon > 30 ||
            !trooperSkill
              .getAvailableWeapons()
              .includes(req.body.config.CWeapon)
          ) {
            return sendError(res, 400, "Invalid weapon");
          }
        }

        await prisma.trooper.update({
          where: {
            id: trooper.id,
          },
          data: {
            CWeapon: req.body.config.CWeapon,
            CBody: req.body.config.CBody,
            targetSystem: req.body.config.targetSystem,
            targetType: 0,
            moveSystem: req.body.config.moveSystem,
            selectedItems: req.body.config.selectedItems ?? [],
          },
        });

        res.send(true);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to update config";
        return sendError(res, 401, message);
      }
    },

  chooseSkill:
    (prisma: PrismaClient) => async (req: Request, res: Response) => {
      try {
        if (!req.body.trooperId || typeof req.body.trooperId != "string") {
          return sendError(res, 400, "Invalid trooper");
        }
        if (
          req.body.skillIndex == null ||
          typeof req.body.skillIndex != "number" ||
          req.body.skillIndex < 0 ||
          req.body.skillIndex > 2
        ) {
          return sendError(res, 400, "Invalid skill index");
        }

        const user = await auth(prisma, req);
        const trooper = user.troopers.find((x) => x.id === req.body.trooperId);
        if (!trooper) {
          return sendError(res, 404, "Trooper not found");
        }

        if (req.body.skillIndex == 2) {
          const trooperSkill = new TrooperSkill(trooper.seed, trooper.choices);
          if (!trooperSkill.getSkills().includes(64)) {
            return sendError(res, 400, "Skill not available");
          }
        }

        const upgradeCost = getUpgradeCost(trooper.choices.length + 1);
        if (user.gold < upgradeCost) {
          return sendError(res, 400, "Not enough gold");
        }

        const userUpdated = await prisma.$transaction(async (tx) => {
          const goldUpdate = await tx.user.updateMany({
            where: {
              id: user.id,
              gold: { gte: upgradeCost },
            },
            data: {
              gold: { decrement: upgradeCost },
              power: { increment: 1 },
            },
          });

          if (goldUpdate.count === 0) {
            throw new Error("Not enough gold");
          }

          await tx.trooper.update({
            where: {
              id: trooper.id,
            },
            data: {
              choices: {
                push: req.body.skillIndex,
              },
            },
          });

          return tx.user.findFirst({
            where: { id: user.id },
            include: IncludeAllUserData(),
          });
        });

        res.send(sanitizeUser(userUpdated));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Failed to choose skill";
        return sendError(res, 400, message);
      }
    },

  add: (prisma: PrismaClient) => async (req: Request, res: Response) => {
    try {
      if (!req.body.trooper || typeof req.body.trooper != "string") {
        return sendError(res, 400, "Invalid trooper");
      }

      const user = await auth(prisma, req);
      if (user.troopers.length > 11) {
        return sendError(res, 400, "Trooper limit reached");
      }

      const existingTodayTrooper = await prisma.trooperDay.findFirst({
        where: {
          id: req.body.trooper,
        },
      });

      if (!existingTodayTrooper) {
        return sendError(res, 400, "Invalid trooper of the day");
      }

      const goldNeeded = getAddCost(user.troopers.length);
      if (!(goldNeeded > 0) || user.gold < goldNeeded) {
        return sendError(res, 400, "Not enough gold");
      }

      const updatedUser = await prisma.$transaction(async (tx) => {
        const goldUpdate = await tx.user.updateMany({
          where: {
            id: user.id,
            gold: { gte: goldNeeded },
          },
          data: {
            gold: { decrement: goldNeeded },
            power: { increment: 5 },
          },
        });

        if (goldUpdate.count === 0) {
          throw new Error("Not enough gold");
        }

        await tx.trooper.create({
          data: {
            userId: user.id,
            name: existingTodayTrooper.name,
            group: user.color,
            seed: existingTodayTrooper.seed,
            choices: [],
          },
        });

        return tx.user.findFirst({
          where: { id: user.id },
          include: IncludeAllUserData(),
        });
      });

      res.send(sanitizeUser(updatedUser));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add trooper";
      return sendError(res, 400, message);
    }
  },
};

export default Troopers;
