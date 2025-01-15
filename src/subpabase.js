import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addFollowersToDb(slaveUsername, followersArray) {
  const newlyAddedFollowers = [];
  const newRelationshipsAdded = [];

  try {
    // Step 1: Fetch only followers in the array that already exist in the "followers" table
    const { data: existingFollowers, error: fetchError } = await supabase
      .from("followers")
      .select("username")
      .in("username", followersArray);

    if (fetchError) {
      console.error("Error fetching existing followers:", fetchError);
      throw new Error("errorAddingFollowersSupabase");
    }

    const existingFollowerSet = new Set(
      existingFollowers.map((f) => f.username)
    );

    // Step 2: Upsert only new followers
    const upsertFollowers = followersArray
      .filter((username) => !existingFollowerSet.has(username))
      .map((username) => ({
        username,
        created_at: new Date().toISOString(),
      }));

    if (upsertFollowers.length > 0) {
      const { error: upsertError } = await supabase
        .from("followers")
        .upsert(upsertFollowers, { onConflict: "username" });

      if (upsertError) {
        console.error("Error upserting followers:", upsertError);
        throw new Error("errorAddingFollowersSupabase");
      }

      // Collect newly added followers
      upsertFollowers.forEach((follower) =>
        newlyAddedFollowers.push(follower.username)
      );

      console.log(`Upserted ${newlyAddedFollowers.length} new followers.`);
    } else {
      console.log("No new followers to upsert.");
    }

    // Step 3: Fetch existing relationships for the slave account
    const { data: existingRelationships, error: fetchRelationshipsError } =
      await supabase
        .from("slave_account_followers")
        .select("follower_username")
        .eq("slave_username", slaveUsername);

    if (fetchRelationshipsError) {
      console.error(
        "Error fetching existing relationships:",
        fetchRelationshipsError
      );
      throw new Error("errorAddingFollowersSupabase");
    }

    const existingRelationshipSet = new Set(
      existingRelationships.map((rel) => rel.follower_username)
    );

    // Step 4: Insert only new relationships
    const newRelationships = followersArray
      .filter((username) => !existingRelationshipSet.has(username))
      .map((username) => ({
        slave_username: slaveUsername,
        follower_username: username,
        followed_at: new Date().toISOString(),
      }));

    if (newRelationships.length > 0) {
      const { error: insertError } = await supabase
        .from("slave_account_followers")
        .insert(newRelationships);

      if (insertError) {
        console.error("Error inserting new relationships:", insertError);
        throw new Error("errorAddingFollowersSupabase");
      }

      // Collect newly added relationships
      newRelationships.forEach((rel) =>
        newRelationshipsAdded.push(rel.follower_username)
      );

      console.log(
        `Inserted ${newRelationshipsAdded.length} new relationships.`
      );
    } else {
      console.log("No new relationships to insert.");
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return "errorAddingFollowersSupabase";
  }

  // Return newly added followers and relationships
  return {
    newlyAddedFollowers,
    newRelationshipsAdded,
  };
}

export { addFollowersToDb };
