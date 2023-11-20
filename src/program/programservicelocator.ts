import { ProgramDto } from "src/program/program.dto";
import { BMGStoProgramDto } from "src/program/bmgstoProgram.dto";

export interface IProgramServicelocator {
  createProgram(request: any, programDto: ProgramDto);
  getProgramDetailsById(request: any, programId: String);
  getCurrentProgramId(request: any, fbmgstoprogramdto: BMGStoProgramDto);
}

