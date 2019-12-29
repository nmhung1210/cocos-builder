if (cc && cc.Label) {
    const isDevTool = window.navigator && (/AlipayIDE/.test(window.navigator.userAgent));
    const gfx = cc.gfx;
    const Label = cc.Label;

    Object.assign(Label.prototype, {
        setMaterial (index, material) {
            cc.RenderComponent.prototype.setMaterial.call(this, index, material);

            // init blend factor
            let dstBlendFactor = cc.macro.BlendFactor.ONE_MINUS_SRC_ALPHA;
            let srcBlendFactor;
            if (!(isDevTool || this.font instanceof cc.BitmapFont)) {
                // Premultiplied alpha on runtime
                srcBlendFactor = cc.macro.BlendFactor.ONE;
            }
            else {
                srcBlendFactor = cc.macro.BlendFactor.SRC_ALPHA;
            }

            // set blend func
            let passes = material._effect.getDefaultTechnique().passes;
            for (let j = 0; j < passes.length; j++) {
                let pass = passes[j];
                pass.setBlend(
                    true,
                    gfx.BLEND_FUNC_ADD,
                    srcBlendFactor, dstBlendFactor,
                    gfx.BLEND_FUNC_ADD,
                    srcBlendFactor, dstBlendFactor,
                );
            }

            material.setDirty(true);
        },
    });
}