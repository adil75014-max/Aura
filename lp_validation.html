function nouvelleVersion(rapportOriginal, nouveauContenu, userId) {
    const timestamp = Date.now().toString();
    const newHash = genererHashRapport(
        nouveauContenu,
        timestamp,
        userId,
        rapportOriginal.hash
    );

    const rapportV2 = {
        id: crypto.randomUUID(),
        contenu: nouveauContenu,
        createdAt: timestamp,
        createdBy: userId,
        hash: newHash,
        previousHash: rapportOriginal.hash,
        version: rapportOriginal.version + 1,
        parentId: rapportOriginal.parentId || rapportOriginal.id
    };

    appendToStorage("rapports", rapportV2);

    logAudit({
        userId,
        action: "NOUVELLE_VERSION_RAPPORT",
        rapportId: rapportV2.id,
        hashAvant: rapportOriginal.hash,
        hashApres: newHash
    });

    return rapportV2;
}