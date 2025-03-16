import { CoBuyingOwnerAuth } from '@interface/auth';

export const OwnerAuthProjectionExpression = 'ownerName, id, ownerPassword';

export function mapToCoBuyingOwnerAuth(res: any): CoBuyingOwnerAuth {
    return {
        ownerName: res.ownerName.S,
        ownerPassword: res.ownerPassword.S,
        coBuyingId: res.id.S,
    };
}
