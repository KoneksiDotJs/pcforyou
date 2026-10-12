import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { addPriceSyncJob } from "../queues/price.queue";

export const createSync = async (req: Request, res: Response): Promise<void> => {
    try {
        const { componentId } = req.body;
        let components = [];

        if (componentId && componentId !== 'ALL') {
            // Jika ada ID spesifik, cari hanya 1 komponen itu
            const singleComponent = await prisma.component.findUnique({
                where: { id: componentId },
                select: { id: true, name: true }
            });
            if (singleComponent) components.push(singleComponent);
        } else {
            // Jika ALL atau kosong, ambil semua
            components = await prisma.component.findMany({
                select: { id: true, name: true }
            });
        }

        if (components.length === 0) {
            res.status(404).json({ status: 'error', message: '[ ERROR: COMPONENT NOT FOUND IN DATABASE ]' });
            return;
        }

        let queuedJobs = 0;
        for (const component of components) {
            await addPriceSyncJob(component.id, component.name);
            queuedJobs++;
        }

        res.status(200).json({
            status: 'success',
            message: `[ SYSTEM: SUCCESSFULLY QUEUED ${queuedJobs} SYNC JOB(S) ]`,
        });
    } catch (error) {
        console.error('[Sync Controller Error]', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};