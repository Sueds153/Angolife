import { describe, it, expect } from 'vitest';
import { JobService } from './JobService';
import { ExchangeService } from './ExchangeService';

describe('JobService', () => {
    it('should fetch a list of jobs including manual and source-based ones', async () => {
        const jobs = await JobService.fetchJobs();
        expect(jobs.length).toBeGreaterThan(0);
        
        // Verify structure
        const firstJob = jobs[0];
        expect(firstJob).toHaveProperty('id');
        expect(firstJob).toHaveProperty('title');
        
        // Find a sourced job
        const sourcedJob = jobs.find(j => j.source !== undefined);
        expect(sourcedJob).toBeDefined();
        if (sourcedJob) {
            console.log(`Verified Scraped Job: ${sourcedJob.title} via ${sourcedJob.source}`);
        }
    });
});

describe('ExchangeService', () => {
    it('should fetch initial rates', async () => {
        const rates = await ExchangeService.getRates();
        expect(rates.length).toBeGreaterThan(0);
        
        const usd = rates.find(r => r.currency === 'USD');
        expect(usd).toBeDefined();
        console.log(`Current Rate: USD Formal ${usd?.formal} | Informal ${usd?.informal}`);
    });

    it('should update informal rate correctly', async () => {
        const NEW_RATE = 1500;
        const updatedRates = await ExchangeService.updateInformalRate('USD', NEW_RATE);
        
        const usd = updatedRates.find(r => r.currency === 'USD');
        expect(usd?.informal).toBe(NEW_RATE);
        console.log(`Updated Rate: USD Informal is now ${usd?.informal}`);
    });
});
