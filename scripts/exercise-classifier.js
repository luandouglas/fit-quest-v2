const fs = require("fs");
const path = require("path");

const VALID_OBJECTIVES = new Set([
  "hipertrofia",
  "forca",
  "emagrecimento",
  "resistencia",
  "saude",
]);

const VALID_EXPERIENCE = new Set(["iniciante", "intermediario", "avancado"]);

function normalizeText(value) {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function loadExercises(filePath) {
  const resolved = path.resolve(filePath || "exercises.json");
  const raw = fs.readFileSync(resolved, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.exercises)) {
    throw new Error("Arquivo de exercicios invalido: campo exercises ausente.");
  }
  return parsed.exercises;
}

function scoreObjective(exercise, objective) {
  const score = { value: 0, reasons: [] };
  if (!objective) return score;

  if (objective === "forca") {
    if (exercise.movement_type === "composto") {
      score.value += 20;
      score.reasons.push("composto favorece ganho de forca");
    }
    if (["barra", "halter", "smith"].includes(exercise.equipment)) {
      score.value += 10;
      score.reasons.push("equipamento livre util para sobrecarga progressiva");
    }
    if (["agachar", "hinge", "empurrar", "puxar"].includes(exercise.mechanics)) {
      score.value += 10;
      score.reasons.push("padrao mecanico relevante para forca");
    }
  }

  if (objective === "hipertrofia") {
    if (exercise.movement_type === "composto") {
      score.value += 12;
      score.reasons.push("composto ajuda no volume total");
    }
    if (exercise.movement_type === "isolado") {
      score.value += 8;
      score.reasons.push("isolado ajuda a enfatizar grupos especificos");
    }
    if (["maquina", "cabo", "halter", "barra"].includes(exercise.equipment)) {
      score.value += 8;
      score.reasons.push("equipamento favoravel para controle de tensao");
    }
  }

  if (objective === "emagrecimento") {
    if (exercise.movement_type === "composto") {
      score.value += 18;
      score.reasons.push("composto aumenta demanda energetica");
    }
    if (["fullbody", "pernas", "costas"].includes(exercise.body_region)) {
      score.value += 12;
      score.reasons.push("grandes grupos musculares elevam gasto calorico");
    }
    if (exercise.mechanics === "estabilizacao") {
      score.value += 4;
      score.reasons.push("estabilizacao melhora controle corporal");
    }
  }

  if (objective === "resistencia") {
    if (exercise.difficulty === "iniciante" || exercise.difficulty === "intermediario") {
      score.value += 10;
      score.reasons.push("dificuldade adequada para maior repeticao");
    }
    if (exercise.movement_type === "composto") {
      score.value += 10;
      score.reasons.push("composto facilita circuitos e blocos longos");
    }
    if (["peso_corporal", "elastico", "cabo", "kettlebell"].includes(exercise.equipment)) {
      score.value += 8;
      score.reasons.push("equipamento pratico para volume de treino");
    }
  }

  if (objective === "saude") {
    if (exercise.difficulty === "iniciante") {
      score.value += 12;
      score.reasons.push("dificuldade inicial adequada para adesao");
    }
    if (["estabilizacao", "agachar", "hinge"].includes(exercise.mechanics)) {
      score.value += 10;
      score.reasons.push("padrao util para funcionalidade geral");
    }
    if (exercise.movement_type === "composto") {
      score.value += 6;
      score.reasons.push("composto melhora eficiencia de treino");
    }
  }

  return score;
}

function scoreProfile(exercise, profile = {}) {
  const reasons = [];
  let score = 0;

  const objective = normalizeText(profile.objetivo);
  const experience = normalizeText(profile.experiencia);
  const bodyType = normalizeText(profile.biotipo);
  const bodySize = normalizeText(profile.porte_fisico);
  const focusAreas = (profile.foco_muscular || []).map(normalizeText);
  const allowedEquipment = (profile.equipamentos_permitidos || []).map(normalizeText);
  const blockedEquipment = (profile.equipamentos_restritos || []).map(normalizeText);
  const restrictedRegions = (profile.regioes_restritas || []).map(normalizeText);

  const objectiveScore = scoreObjective(exercise, objective);
  score += objectiveScore.value;
  reasons.push(...objectiveScore.reasons);

  if (focusAreas.length > 0 && focusAreas.includes(normalizeText(exercise.body_region))) {
    score += 30;
    reasons.push("alinhado com foco muscular informado");
  }

  if (restrictedRegions.includes(normalizeText(exercise.body_region))) {
    score -= 1000;
    reasons.push("regiao corporal restrita no perfil");
  }

  if (allowedEquipment.length > 0 && !allowedEquipment.includes(normalizeText(exercise.equipment))) {
    score -= 120;
    reasons.push("fora dos equipamentos permitidos");
  }

  if (blockedEquipment.includes(normalizeText(exercise.equipment))) {
    score -= 120;
    reasons.push("equipamento restrito");
  }

  if (experience === "iniciante") {
    if (exercise.difficulty === "iniciante") score += 16;
    if (exercise.difficulty === "intermediario") score += 4;
    if (exercise.difficulty === "avancado") score -= 30;
  }
  if (experience === "intermediario") {
    if (exercise.difficulty === "intermediario") score += 10;
    if (exercise.difficulty === "iniciante") score += 2;
    if (exercise.difficulty === "avancado") score += 4;
  }
  if (experience === "avancado") {
    if (exercise.difficulty === "avancado") score += 14;
    if (exercise.difficulty === "intermediario") score += 6;
  }

  if (bodyType === "ectomorfo") {
    if (exercise.movement_type === "composto") score += 8;
    if (["barra", "halter"].includes(exercise.equipment)) score += 6;
  }
  if (bodyType === "endomorfo") {
    if (exercise.movement_type === "composto") score += 10;
    if (["fullbody", "pernas", "costas"].includes(exercise.body_region)) score += 6;
  }
  if (bodyType === "mesomorfo") {
    score += 2;
  }

  if (bodySize === "leve") {
    if (exercise.difficulty === "iniciante") score += 8;
    if (["peso_corporal", "elastico", "halter"].includes(exercise.equipment)) score += 6;
  }
  if (bodySize === "medio") {
    score += 2;
  }
  if (bodySize === "grande") {
    if (["barra", "maquina", "smith"].includes(exercise.equipment)) score += 8;
    if (exercise.movement_type === "composto") score += 4;
  }

  return { score, reasons: Array.from(new Set(reasons)) };
}

function classifyExercises(params = {}, options = {}) {
  const exercises = loadExercises(options.filePath || "exercises.json");
  const limit = Number(options.limit || params.limite || 30);
  const objective = normalizeText(params.objetivo);
  const experience = normalizeText(params.experiencia);

  if (objective && !VALID_OBJECTIVES.has(objective)) {
    throw new Error(`Objetivo invalido: ${params.objetivo}`);
  }
  if (experience && !VALID_EXPERIENCE.has(experience)) {
    throw new Error(`Experiencia invalida: ${params.experiencia}`);
  }

  const ranked = exercises
    .map((exercise) => {
      const { score, reasons } = scoreProfile(exercise, params);
      return { ...exercise, score, reasons };
    })
    .filter((item) => item.score > -500)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "pt-BR"))
    .slice(0, Math.max(1, limit));

  return {
    profile: params,
    total_input: exercises.length,
    total_ranked: ranked.length,
    exercises: ranked,
  };
}

function parseArgs(argv) {
  const args = { filePath: "exercises.json", limit: 30, params: {} };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--file") args.filePath = argv[i + 1];
    if (token === "--limit") args.limit = Number(argv[i + 1]);
    if (token === "--params") args.params = JSON.parse(argv[i + 1]);
    if (token === "--params-file") {
      const raw = fs.readFileSync(path.resolve(argv[i + 1]), "utf8");
      args.params = JSON.parse(raw);
    }
  }
  return args;
}

if (require.main === module) {
  const { filePath, limit, params } = parseArgs(process.argv.slice(2));
  const result = classifyExercises(params, { filePath, limit });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

module.exports = {
  classifyExercises,
  loadExercises,
};