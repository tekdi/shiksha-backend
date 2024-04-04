import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { QuestionController } from "./question.controller";
import {
  DikshaQuestionToken,
  QumlQuestionService,
} from "src/adapters/diksha/quml.adapter";
import {
  HasuraQuestionToken,
  QuestionService,
} from "src/adapters/hasura/question.adapter";

@Module({
  imports: [HttpModule],
  controllers: [QuestionController],
  providers: [
    QumlQuestionService,
    { provide: DikshaQuestionToken, useClass: QumlQuestionService },
    { provide: HasuraQuestionToken, useClass: QuestionService },
  ],
})
export class QuestionModule {}
