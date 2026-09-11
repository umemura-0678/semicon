import YoutubePlayer from "@/components/YoutubePlayer";
import { getYoutubeId } from "@/utils/youtube";
import { addMaterial, deleteMaterial } from "@/app/chapter2/actions";
import styles from "./Materials.module.css";

export default function Materials({ chapter, materials, isAdminUser }) {
  return (
    <section className={styles.materials}>
      <h2>補足資料</h2>

      {isAdminUser && (
        <form action={addMaterial} className={styles.materialForm}>
          <input type="hidden" name="chapter" value={chapter} />
          <input
            name="title"
            type="text"
            placeholder="タイトル"
            required
          />
          <input
            name="youtube_url"
            type="url"
            placeholder="YouTubeのURL"
            required
          />
          <button type="submit">投稿する</button>
        </form>
      )}

      <div className={styles.materialList}>
        {materials.map((material) => {
          const youtubeId = getYoutubeId(material.youtube_url);

          return (
            <article key={material.id} className={styles.materialCard}>
              {youtubeId && (
                <YoutubePlayer videoId={youtubeId} title={material.title} />
              )}
              <h3>{material.title}</h3>
              {isAdminUser && (
                <form action={deleteMaterial}>
                  <input type="hidden" name="id" value={material.id} />
                  <input type="hidden" name="chapter" value={chapter} />
                  <button type="submit">削除</button>
                </form>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
