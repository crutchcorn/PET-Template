"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class run1515461733723 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, PRIMARY KEY("id"))`);
            yield queryRunner.query(`CREATE TABLE "post" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" text NOT NULL, PRIMARY KEY("id"))`);
            yield queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, PRIMARY KEY("id"))`);
            yield queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, PRIMARY KEY("id"))`);
            yield queryRunner.query(`CREATE TABLE "post_categories_category" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, PRIMARY KEY("postId", "categoryId"))`);
            yield queryRunner.query(`CREATE TABLE "user_roles_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, PRIMARY KEY("userId", "roleId"))`);
            yield queryRunner.query(`ALTER TABLE "post_categories_category" ADD CONSTRAINT "fk_00ee6a3b536439f11fb9e65d762" FOREIGN KEY ("postId") REFERENCES "post"("id")`);
            yield queryRunner.query(`ALTER TABLE "post_categories_category" ADD CONSTRAINT "fk_6e347a1626d70d8dbc0e2ea8bd7" FOREIGN KEY ("categoryId") REFERENCES "category"("id")`);
            yield queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "fk_8578f8f4755c5002039593e32ff" FOREIGN KEY ("userId") REFERENCES "user"("id")`);
            yield queryRunner.query(`ALTER TABLE "user_roles_role" ADD CONSTRAINT "fk_5511fc19794b5157b89a37ec3f5" FOREIGN KEY ("roleId") REFERENCES "role"("id")`);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "fk_5511fc19794b5157b89a37ec3f5"`);
            yield queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "fk_8578f8f4755c5002039593e32ff"`);
            yield queryRunner.query(`ALTER TABLE "post_categories_category" DROP CONSTRAINT "fk_6e347a1626d70d8dbc0e2ea8bd7"`);
            yield queryRunner.query(`ALTER TABLE "post_categories_category" DROP CONSTRAINT "fk_00ee6a3b536439f11fb9e65d762"`);
            yield queryRunner.query(`DROP TABLE "user_roles_role"`);
            yield queryRunner.query(`DROP TABLE "post_categories_category"`);
            yield queryRunner.query(`DROP TABLE "user"`);
            yield queryRunner.query(`DROP TABLE "role"`);
            yield queryRunner.query(`DROP TABLE "post"`);
            yield queryRunner.query(`DROP TABLE "category"`);
        });
    }
}
exports.run1515461733723 = run1515461733723;
//# sourceMappingURL=1515461733723-run.js.map