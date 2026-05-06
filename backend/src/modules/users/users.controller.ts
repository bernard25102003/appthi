import type { Request, Response, NextFunction } from "express";
import * as service from "./users.service";
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from "./users.schema";

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await service.getProfile(req.user!.sub);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await service.updateProfile(req.user!.sub, data);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = await service.getAddresses(req.user!.sub);
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createAddressSchema.parse(req.body);
    const address = await service.createAddress(req.user!.sub, data);
    res.status(201).json({ address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateAddressSchema.parse(req.body);
    const address = await service.updateAddress(req.params.id, req.user!.sub, data);
    res.json({ address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteAddress(req.params.id, req.user!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
