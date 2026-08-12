import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";
import { AppError } from "@cxshop/framework/errors";

type SkillUsage = { prompting: boolean; review: boolean; shopper: boolean };

class HoneySkills {
  private readonly root = resolve(
    process.env.CXSHOP_HONEY_SKILLS_ROOT?.trim() || join(process.cwd(), "storage", "honey-skills")
  );

  async list() {
    await mkdir(this.root, { recursive: true });
    const entries = await readdir(this.root, { withFileTypes: true });
    return Promise.all(
      entries
        .filter((entry) => entry.isDirectory() && validName(entry.name))
        .map((entry) => this.summary(entry.name))
    );
  }

  async create(input: { description: string; name: string }) {
    requireName(input.name);
    const directory = join(this.root, input.name);
    await mkdir(directory, { recursive: false }).catch(() => {
      throw new AppError({
        code: "SKILL_EXISTS",
        message: "This skill already exists.",
        statusCode: 409
      });
    });
    await writeFile(join(directory, "SKILL.md"), manifest(input.name, input.description), "utf8");
    await this.writeUsage(input.name, { prompting: false, review: false, shopper: false });
    return this.summary(input.name);
  }

  async addReference(name: string, filename: string, content: string) {
    const file = normalizeFile(filename);
    const target = this.safeFile(name, file);
    await mkdir(resolve(target, ".."), { recursive: true });
    await writeFile(target, content, { encoding: "utf8", flag: "wx" }).catch((error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === "EEXIST")
        throw new AppError({
          code: "SKILL_FILE_EXISTS",
          message: "This reference already exists.",
          statusCode: 409
        });
      throw error;
    });
    return { file, skill: await this.summary(name) };
  }

  async setUsage(name: string, usage: SkillUsage) {
    await this.writeUsage(name, usage);
    return this.summary(name);
  }

  async promptingContext(audience: "shopper" | "staff") {
    const skills = (await this.list()).filter((skill) =>
      audience === "shopper" ? skill.shopper : skill.prompting
    );
    return Promise.all(
      skills.map(async (skill) => ({
        content: await readFile(join(this.root, skill.name, "SKILL.md"), "utf8"),
        name: skill.name
      }))
    );
  }

  private async summary(name: string) {
    requireName(name);
    const directory = join(this.root, name);
    const content = await readFile(join(directory, "SKILL.md"), "utf8");
    const references = join(directory, "references");
    const entries = await readdir(references, { withFileTypes: true }).catch(() => []);
    const usage = await this.readUsage(name);
    return {
      description: descriptionOf(content),
      files: entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        .map((entry) => `references/${entry.name}`),
      name,
      ...usage
    };
  }

  private safeFile(name: string, file: string) {
    requireName(name);
    const directory = join(this.root, name);
    const target = resolve(directory, file);
    if (!target.startsWith(`${directory}${sep}`) || target.toLowerCase().endsWith("skill.md"))
      throw AppError.validation("Skill file path is invalid.");
    return target;
  }

  private async readUsage(name: string): Promise<SkillUsage> {
    try {
      const value = JSON.parse(
        await readFile(join(this.root, name, ".honey.json"), "utf8")
      ) as Partial<SkillUsage>;
      return {
        prompting: value.prompting === true,
        review: value.review === true,
        shopper: value.shopper === true
      };
    } catch {
      return { prompting: false, review: false, shopper: false };
    }
  }

  private writeUsage(name: string, usage: SkillUsage) {
    requireName(name);
    return writeFile(join(this.root, name, ".honey.json"), JSON.stringify(usage, null, 2), "utf8");
  }
}

function validName(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value) && value.length <= 64;
}
function requireName(value: string) {
  if (!validName(value))
    throw AppError.validation("Skill names use lowercase letters, numbers, and hyphens.");
}
function normalizeFile(value: string) {
  const name = value.trim().replaceAll("\\", "/").split("/").at(-1) ?? "";
  if (!name.toLowerCase().endsWith(".md"))
    throw AppError.validation("Skill references must be Markdown files.");
  return `references/${name}`;
}
function descriptionOf(content: string) {
  return content.match(/^description:\s*"?(.+?)"?$/mu)?.[1] ?? "No description provided.";
}
function manifest(name: string, description: string) {
  return `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\n---\n\n# ${name}\n\nUse this skill when its description applies. Read the references directory for approved business guidance.\n`;
}

export const honeySkills = new HoneySkills();
