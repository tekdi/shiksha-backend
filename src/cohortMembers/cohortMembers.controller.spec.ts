import { Test, TestingModule } from "@nestjs/testing";
import { CohortMembersController } from "./cohortMembers.controller";

describe("CohortMembersController", () => {
  let controller: CohortMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CohortMembersController],
    }).compile();

    controller = module.get<CohortMembersController>(CohortMembersController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
