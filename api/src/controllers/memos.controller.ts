import { Request, Response } from 'express';

export function listMemos(_req: Request, res: Response) {
  res.status(200).json({ data: [], paging: { total: 0 } });
}

export function getMemoById(req: Request, res: Response) {
  res.status(200).json({ id: req.params.id, title: 'placeholder', body: 'placeholder' });
}

export function createMemo(_req: Request, res: Response) {
  res.status(201).json({ id: 'placeholder', title: 'created', body: 'created' });
}

export function updateMemo(req: Request, res: Response) {
  res.status(200).json({ id: req.params.id, title: 'updated', body: 'updated' });
}

export function deleteMemo(_req: Request, res: Response) {
  res.status(204).send();
}
