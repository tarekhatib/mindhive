module.exports = function getRankBySessions(sessions) {
  if (sessions >= 100) return { title: "Mind Master", emoji: "🧠" };
  if (sessions >= 50) return { title: "Elite Scholar", emoji: "📜" };
  if (sessions >= 30) return { title: "Hive Guardian", emoji: "🛡️" };
  if (sessions >= 15) return { title: "Amateur", emoji: "👨‍💻" };
  if (sessions >= 5) return { title: "Focused Bee", emoji: "🐝" };
  return { title: "Newbie", emoji: "🐣" };
};
