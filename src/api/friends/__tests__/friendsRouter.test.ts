import { StatusCodes } from "http-status-codes";
import request from "supertest";


import type { ServiceResponse } from "@/common/models/serviceResponse";
import { friendsTable } from "@/db/schemas";
import { app } from "@/server";
import { getAuthCookie } from "@/utils/utils";
import { InferSelectModel } from "drizzle-orm";

describe("friends API Endpoints", () => {
	describe("GET /friends", () => {

		it("should return a list of friends", async () => {



            const response = await request(app).get("/messages").set("Origin", process.env.BASE_URL || "http://localhost:3000");
            console.log("Response:", response.body);

            const authCookie = await getAuthCookie()

            console.log("Auth Cookie:", authCookie);
			// Act


			const responseBody: ServiceResponse<InferSelectModel<typeof friendsTable>[]> = response.body;

			// Assert
			expect(response.statusCode).toEqual(StatusCodes.OK);

		});
	});


});
