export interface BaselineStatus {
    status: 'widely-available' | 'newly-available' | 'limited-availability' | 'unknown';
    feature: string;
    description?: string;
}

export class BaselineChecker {
    private featuresData: any = null;
    private loadingPromise: Promise<void> | null = null;

    constructor() {
        this.loadingPromise = this.loadFeaturesData();
    }

    private async loadFeaturesData() {
        try {
            const webFeatures = await import('web-features');
            this.featuresData = (webFeatures as any).default || (webFeatures as any).features || webFeatures;
            console.log(`Web features data loaded successfully - ${Object.keys(this.featuresData).length} features available`);
        } catch (error) {
            console.error('Failed to load web-features data:', error);
            this.featuresData = {};
        }
    }

    async checkFeature(featureId: string): Promise<BaselineStatus> {
        if (this.loadingPromise) {
            await this.loadingPromise;
            this.loadingPromise = null;
        }
        
        const feature = this.featuresData[featureId];
        
        if (!feature) {
            return {
                status: 'unknown',
                feature: featureId,
                description: 'Feature not found in baseline data'
            };
        }

        const baselineStatus = feature.status?.baseline;
        let status: BaselineStatus['status'];

        if (baselineStatus === true || baselineStatus === 'high') {
            status = 'widely-available';
        } else if (baselineStatus === 'newly' || baselineStatus === 'low') {
            status = 'newly-available';
        } else if (baselineStatus === false) {
            status = 'limited-availability';
        } else {
            status = 'unknown';
        }

        return {
            status,
            feature: featureId,
            description: feature.description_html || feature.description || `${featureId} compatibility`
        };
    }
}