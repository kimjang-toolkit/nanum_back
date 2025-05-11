import { SocialType, UserMaster } from "@domain/user"

export const mapUserMasterOne = (item: Record<string, Record<string, any>>): UserMaster => {
    return {
        id: item.id.S,
        name: item.name.S,
        email: item.email?.S || null,
        password: item.password?.S || null,
        nickName: item.nickName?.S || null,
        joinedAt: item.joinedAt.S,
        socialIds: item.socialIds?.L?.map((socialId: any) => ({
            type: socialId.M.type.S as SocialType,
            account: socialId.M.account.S,
            socialUserId: socialId.M.socialUserId.S
        })) || [],
        coBuyingHistory: item.coBuyingHistory?.L?.map((coBuyingHistory: any) => ({
            coBuyingId: coBuyingHistory.M.coBuyingId.S,
            createdAt: coBuyingHistory.M.createdAt.S,
            productName: coBuyingHistory.M.productName.S,
            thumbnailUrl: coBuyingHistory.M.thumbnailUrl?.S || null
        })) || [],
        applyHistory: item.applyHistory?.L?.map((applyHistory: any) => ({
            coBuyingId: applyHistory.M.coBuyingId.S,
            createdAt: applyHistory.M.createdAt.S,
            productName: applyHistory.M.productName.S,
            thumbnailUrl: applyHistory.M.thumbnailUrl?.S || null,
            ownerName: applyHistory.M.ownerName.S,
            appliedAt: applyHistory.M.appliedAt.S
        })) || [],
        location: item.location ? {
            lat: item.location.M.lat.N,
            lng: item.location.M.lng.N,
            locationTags: item.location.M.locationTags.L.map((locationTag: any) => locationTag.M.locationTag.S),
            address: item.location.M.address.S
        } : null
    } as UserMaster
}