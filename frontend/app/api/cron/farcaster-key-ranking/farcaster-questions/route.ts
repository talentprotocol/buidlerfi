import { ERRORS } from "@/lib/errors";
import { getTopUsersByQuestionsAskedInTimeInterval } from "@/backend/user/user";

export const GET = async () => {
    try {
        const topUsers = getTopUsersByQuestionsAskedInTimeInterval(10, 4);
        return Response.json({ topUsers });
    } catch (error) {
        console.error(error);
        return Response.json({ error: ERRORS.SOMETHING_WENT_WRONG }, { status: 500 });
    }
};