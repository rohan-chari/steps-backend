import { prisma } from '../config/prisma';
import { SendFriendRequestData, RespondToFriendRequestData, CancelFriendRequestData } from '../schemas/social.schema';

export const SocialRepo = {
  async getCurrentUser(firebaseUid: string) {
    return await prisma.user.findUnique({ where: { firebaseUid } });
  },
  async sendFriendRequest(senderId: number, data: SendFriendRequestData) {
    const { receiverId } = data;

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId } })
    ]);

    if (!sender) {
      throw new Error('Sender user not found');
    }
    if (!receiver) {
      throw new Error('Receiver user not found');
    }

    // Check if trying to send request to self
    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if request already exists (in any status)
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        throw new Error('Friend request already exists');
      } else {
        throw new Error('Friend request already exists with status: ' + existingRequest.status);
      }
    }

    // Create the friend request
    return await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        }
      }
    });
  },

  async respondToFriendRequest(userId: number, data: RespondToFriendRequestData) {
    const { requestId, status } = data;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        }
      }
    });

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    // Check if user is the receiver of this request
    if (friendRequest.receiverId !== userId) {
      throw new Error('You can only respond to friend requests sent to you');
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      throw new Error('Friend request has already been responded to');
    }

    if (status === 'accepted') {
      // Update the friend request to accepted
      return await prisma.friendRequest.update({
        where: { id: requestId },
        data: {
          status: 'accepted',
          respondedAt: new Date()
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              displayName: true,
              photoUrl: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              displayName: true,
              photoUrl: true
            }
          }
        }
      });
    } else {
      // For rejection, delete the friend request
      await prisma.friendRequest.delete({
        where: { id: requestId }
      });
      
      return { success: true, message: 'Friend request rejected successfully' };
    }
  },

  async cancelFriendRequest(userId: number, data: CancelFriendRequestData) {
    const { requestId } = data;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!friendRequest) {
      throw new Error('Friend request not found');
    }

    // Check if user is the sender of this request
    if (friendRequest.senderId !== userId) {
      throw new Error('You can only cancel friend requests you sent');
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      throw new Error('Friend request has already been responded to');
    }

    // Delete the friend request
    await prisma.friendRequest.delete({
      where: { id: requestId }
    });

    return { success: true, message: 'Friend request canceled successfully' };
  },

  async getFriendRequests(userId: number) {
    // Get incoming friend requests (pending requests sent to this user)
    const incomingRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: 'pending'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get outgoing friend requests (pending requests sent by this user)
    const outgoingRequests = await prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: 'pending'
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      incoming: incomingRequests,
      outgoing: outgoingRequests
    };
  },

  async getFriends(userId: number) {
    // Get accepted friend requests where user is either sender or receiver
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            photoUrl: true
          }
        }
      },
      orderBy: { respondedAt: 'desc' }
    });

    // Extract friends (the other user in each friend request)
    const friends = friendRequests.map(request => {
      return request.senderId === userId ? request.receiver : request.sender;
    });

    return friends;
  }
};
