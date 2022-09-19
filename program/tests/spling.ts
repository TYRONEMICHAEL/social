import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Spling } from "../target/types/spling";
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

describe("spling", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Spling as Program<Spling>;

  const shdw = anchor.web3.Keypair.generate();


  it("Sets up spling", async () => {
  
    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

      await program.methods
      .setupSpling()
      .accounts({
        user: provider.wallet.publicKey,
        spling: SplingPDA,
      })
      .rpc()

      const spling = await program.account.spling.fetch(SplingPDA);
      console.log(spling);

  });




  it("Creates User Profile", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

      await program.methods
      .createUserProfile("ipfs://QmaJ5xTB9FkHeKK8gLh2WwHSGe38J4mfkXEAzcGY6agb4s")
      .accounts({
        user: provider.wallet.publicKey,
        spling: SplingPDA,
        userProfile: UserProfilePDA,
      })
      .rpc()

      const user_id = await program.account.userProfile.fetch(UserProfilePDA);
      console.log(user_id);
  });

  it("Follows a user", async () => {
    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )
    
    const following = anchor.web3.Keypair.generate();
    const follower = anchor.web3.Keypair.generate();

    const fromAirDropSignature1 =  await provider.connection.requestAirdrop(following.publicKey, 1*LAMPORTS_PER_SOL);
    const fromAirDropSignature2 =await provider.connection.requestAirdrop(follower.publicKey, 1*LAMPORTS_PER_SOL);

    await provider.connection.confirmTransaction(fromAirDropSignature1);
    await provider.connection.confirmTransaction(fromAirDropSignature2);

    const [UserFollowingProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        following.publicKey.toBuffer(),
      ],
      program.programId
    )

    const [UserFollowerProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        follower.publicKey.toBuffer(),
      ],
      program.programId
    )

    await program.methods
      .createUserProfile("ipfs://QmaJ5xTB9FkHeKK8gLh2WwHSGe38J4mfkXEAzcGY6agb4s")
      .accounts({
        user: following.publicKey,
        spling: SplingPDA,
        userProfile: UserFollowingProfilePDA,
      })
      .signers([following])
      .rpc()
    
    await program.methods
      .createUserProfile("ipfs://QmaJ5xTB9FkHeKK8gLh2WwHSGe38J4mfkXEAzcGY6agb4s")
      .accounts({
        user: follower.publicKey,
        spling: SplingPDA,
        userProfile: UserFollowerProfilePDA,
      })
      .signers([follower])
      .rpc()
    
    const [FollowerPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('follower'),
        following.publicKey.toBuffer(),
      ],
      program.programId
    )


    await program.methods
      .followUser()
      .accounts({
        user: follower.publicKey,
        userAccount: UserFollowerProfilePDA,
        followingAccount: UserFollowingProfilePDA,
        spling: SplingPDA,
        follower: FollowerPDA,
      })
      .signers([follower])
      .rpc()

    const follow_id = await program.account.follower.fetch(FollowerPDA);

    const followersResult = await program.account.follower.all([{
      memcmp: {
        offset: 16, // number of bytes
        bytes: follow_id.following.toBase58(), // base58 encoded string
      },
    }])

    const followingResult = await program.account.follower.all([{
      memcmp: {
        offset: 48, // number of bytes
        bytes: follow_id.user.toBase58(), // base58 encoded string
      },
    }])

    console.log(followersResult);
    console.log(followingResult);
  });



  it.skip("Creates Group Profile", async () => {
  

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [GroupProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('group_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const shdw = anchor.web3.Keypair.generate();

      await program.methods
      .createGroupProfile(shdw.publicKey)
      .accounts({
        user: provider.wallet.publicKey,
        spling: SplingPDA,
        groupProfile: GroupProfilePDA,
      })
      .rpc()

      const group_id = await program.account.groupProfile.fetch(GroupProfilePDA);
      console.log(group_id);

  });



  it.skip("Submits a post", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const [PostPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('post'),
        shdw.publicKey.toBuffer(),
      ],
      program.programId
    )

      await program.methods
      .submitPost(1, shdw.publicKey)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        post: PostPDA,
        spling: SplingPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

      const post = await program.account.post.fetch(PostPDA);
      console.log(post);

  });


  it.skip("Join a group", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const shdw = anchor.web3.Keypair.generate();

      await program.methods
      .joinGroup(33)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        spling: SplingPDA,
      })
      .rpc()

      const user_id = await program.account.userProfile.fetch(UserProfilePDA);
      console.log(user_id);

  });


  it.skip("Follow another user", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const shdw = anchor.web3.Keypair.generate();

      await program.methods
      .followUser(4)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        spling: SplingPDA,
      })
      .rpc()

      const user_id = await program.account.userProfile.fetch(UserProfilePDA);
      console.log(user_id);

  });



  it.skip("Check spling", async () => {
  
    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

      // const spling = await program.account.spling.fetch(SplingPDA);
      // console.log(spling);

  });

  it.skip("Show group membership", async () => {
    const spling = await program.account.userProfile.all();
    console.log(spling[0].account.groups);
  });


  it.skip("Unfollow another user", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const shdw = anchor.web3.Keypair.generate();

      await program.methods
      .unfollowUser(4)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        spling: SplingPDA,
      })
      .rpc()

      const user_id = await program.account.userProfile.fetch(UserProfilePDA);
      console.log(user_id);

  });

  it.skip("Leave a group", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const shdw = anchor.web3.Keypair.generate();

      await program.methods
      .leaveGroup(33)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        spling: SplingPDA,
      })
      .rpc()

      // const user_id = await program.account.userProfile.fetch(UserProfilePDA);
      // console.log(user_id);

  });

  it.skip("Show group memberships", async () => {
    const spling = await program.account.userProfile.all();
    console.log(spling[0].account.groups);
  });




  it.skip("Delete a post", async () => {

    const [SplingPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('spling'),
      ],
      program.programId
    )

    const [UserProfilePDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('user_profile'),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    )

    const [PostPDA] = await PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode('post'),
        shdw.publicKey.toBuffer(),
      ],
      program.programId
    )

      await program.methods
      .deletePost(1, shdw.publicKey)
      .accounts({
        user: provider.wallet.publicKey,
        userProfile: UserProfilePDA,
        post: PostPDA,
        spling: SplingPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc()

      // const post = await program.account.post.fetch(PostPDA);
      // console.log(post);

  });


});
