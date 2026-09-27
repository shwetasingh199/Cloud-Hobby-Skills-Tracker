function SkillCard({
  skill,
  onDelete
}) {

  return (

    <div className="skill-card">

      <div>

        <span className="badge">
          {skill.category}
        </span>

        <h3>
          {skill.skillName}
        </h3>

        <p>
          Current:
          {" "}
          {skill.currentLevel}
        </p>

        <p>
          Target:
          {" "}
          {skill.targetLevel}
        </p>

        <p>
          Status:
          {" "}
          {skill.status}
        </p>

      </div>

      <button
        className="danger-btn"
        onClick={() =>
          onDelete(skill.id)
        }
      >
        Delete
      </button>

    </div>

  );
}

export default SkillCard;