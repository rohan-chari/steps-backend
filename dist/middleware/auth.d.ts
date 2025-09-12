import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                email?: string;
                email_verified?: boolean;
                name?: string;
                picture?: string;
                firebase: {
                    identities: {
                        email?: string[];
                        [key: string]: any;
                    };
                    sign_in_provider: string;
                };
            };
        }
    }
}
export declare const firebaseAuth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const optionalFirebaseAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map