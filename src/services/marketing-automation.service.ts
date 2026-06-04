import { SKU } from '../types';

export class MarketingAutomationService {
  async triggerFirstPurchaseDiscount(customerId: string): Promise<boolean> {
    return true;
  }

  async retargetChurnedCustomers(): Promise<number> {
    return 0;
  }

  async sendRepurchaseReminders(): Promise<number> {
    return 0;
  }

  async upgradeVIPCustomers(criteria: any): Promise<number> {
    return 0;
  }

  async launchClearanceCampaign(slowMovingSkus: SKU[]): Promise<boolean> {
    return true;
  }
}
