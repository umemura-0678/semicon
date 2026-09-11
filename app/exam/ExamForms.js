import { addExamForm, deleteExamForm } from "./actions";
import styles from "./page.module.css";

export default function ExamForms({ forms, isAdminUser }) {
  return (
    <section className={styles.forms}>
      <h2>Forms一覧</h2>

      {isAdminUser && (
        <form action={addExamForm} className={styles.form}>
          <input name="title" type="text" placeholder="タイトル" required />
          <input
            name="forms_url"
            type="url"
            placeholder="Microsoft FormsのURL"
            required
          />
          <label className={styles.fileLabel}>
            QRコード選択
            <input
              className={styles.fileInput}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/gif,image/webp"
              required
            />
          </label>
          <button type="submit">投稿する</button>
        </form>
      )}

      <div className={styles.formList}>
        {forms.map((item) => (
          <article key={item.id} className={styles.formCard}>
            <a
              href={item.forms_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.formLink}
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className={styles.qrImage}
                />
              )}
              <h3>{item.title}</h3>
              <p>{item.forms_url}</p>
            </a>
            {isAdminUser && (
              <form action={deleteExamForm}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit">削除</button>
              </form>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
